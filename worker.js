import { Router } from 'itty-router';
import bcrypt from 'bcryptjs';

const router = Router();

// ===== Middleware =====
const requireAuth = async (request, env) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const session = await env.DB.prepare(
    'SELECT s.*, u.id as user_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
  ).bind(token).first();

  if (!session) {
    return null;
  }

  return {
    token: session.token,
    user_id: session.user_id,
    expires_at: session.expires_at
  };
};

const generateToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// ===== EXIF Parser =====
function parseEXIF(bytes) {
  const exif = {
    camera_make: null,
    camera_model: null,
    lens_model: null,
    iso: null,
    aperture: null,
    shutter_speed: null,
    focal_length: null,
    exposure_compensation: null,
    datetime_taken: null,
    gps_latitude: null,
    gps_longitude: null,
  };

  if (!bytes || bytes.byteLength < 2) {
    console.log('EXIF: Invalid byte array');
    return exif;
  }

  const uint8 = new Uint8Array(bytes);

  // Only support JPEG for now
  if (uint8[0] !== 0xFF || uint8[1] !== 0xD8) {
    console.log('EXIF: Not a JPEG file');
    return exif;
  }

  console.log('EXIF: Starting to parse JPEG');

  let offset = 2;
  while (offset < bytes.byteLength) {
    if (uint8[offset] !== 0xFF) {
      console.log('EXIF: Invalid marker at offset', offset);
      break;
    }

    const marker = uint8[offset + 1];
    offset += 2;

    // APP1 marker (EXIF data)
    if (marker === 0xE1) {
      const size = (uint8[offset] << 8) | uint8[offset + 1];
      console.log('EXIF: Found APP1 marker, size:', size);

      if (size > 6 && uint8[offset + 2] === 0x45 && uint8[offset + 3] === 0x78 &&
          uint8[offset + 4] === 0x69 && uint8[offset + 5] === 0x66) {
        console.log('EXIF: Found EXIF data');
        const dataOffset = offset + 6;

        // Check for alignment padding (0x0000) before TIFF header
        let tiffOffset = dataOffset;
        if (uint8[dataOffset] === 0x00 && uint8[dataOffset + 1] === 0x00) {
          tiffOffset += 2;
          console.log('EXIF: Found alignment padding, TIFF header starts at:', tiffOffset);
        }

        parseTIFF(uint8, tiffOffset, exif);
      }
      offset += size + 2;
    } else if (marker === 0xDA) {
      // Start of scan, no more markers
      console.log('EXIF: Reached image data, stopping');
      break;
    } else if ((marker >= 0xD0 && marker <= 0xD7) || marker === 0xD9) {
      // No size
      continue;
    } else {
      // Skip other markers
      const size = (uint8[offset] << 8) | uint8[offset + 1];
      if (size + 2 > bytes.byteLength - offset) {
        console.log('EXIF: Invalid marker size');
        break;
      }
      offset += size + 2;
    }
  }

  console.log('EXIF: Parsed result:', JSON.stringify(exif, null, 2));
  return exif;
}

function parseTIFF(uint8, offset, exif) {
  const view = new DataView(uint8.buffer, offset);
  const byteOrder = view.getUint16(0);
  const endian = byteOrder === 0x4949;
  const getUint16 = (pos) => view.getUint16(pos, endian);
  const getUint32 = (pos) => view.getUint32(pos, endian);
  const getSInt32 = (pos) => view.getInt32(pos, endian);

  console.log('EXIF: Byte order:', byteOrder === 0x4949 ? 'Little-endian (II)' : 'Big-endian (MM)');

  const ifdOffset = getUint32(4);
  console.log('EXIF: IFD offset from TIFF header:', ifdOffset, '(relative to TIFF start)');
  parseIFD(uint8, offset + ifdOffset, endian, exif, getSInt32, offset);
}

function parseIFD(uint8, offset, endian, exif, getSInt32, tiffStart) {
  const view = new DataView(uint8.buffer, offset);
  const getUint16 = (pos) => view.getUint16(pos, endian);
  const getUint32 = (pos) => view.getUint32(pos, endian);

  // Global view for reading offset-based values (valueOffset is relative to TIFF header)
  const globalView = new DataView(uint8.buffer);
  const getGlobalUint16 = (pos) => globalView.getUint16(pos, endian);
  const getGlobalUint32 = (pos) => globalView.getUint32(pos, endian);
  const getGlobalSInt32 = (pos) => globalView.getInt32(pos, endian);

  const numEntries = getUint16(0);
  let pos = 2;

  for (let i = 0; i < numEntries; i++) {
    const tag = getUint16(pos);
    const type = getUint16(pos + 2);
    const count = getUint32(pos + 4);
    const valueOffset = getUint32(pos + 8);

    let value = null;

    if (type === 2) { // ASCII string
      const dataOffset = count > 4 ? tiffStart + valueOffset : pos + 8;
      value = '';
      for (let j = 0; j < count - 1; j++) {
        const charCode = uint8[dataOffset + j];
        if (charCode >= 32 && charCode <= 126) {
          value += String.fromCharCode(charCode);
        }
      }
      value = value.trim();
    } else if (type === 3 && count === 1) { // Short
      value = getUint16(pos + 8);
    } else if (type === 4 && count === 1) { // Long
      value = getUint32(pos + 8);
    } else if (type === 5 && count === 1) { // Rational
      const absOffset = tiffStart + valueOffset;
      const num = getGlobalUint32(absOffset);
      const den = getGlobalUint32(absOffset + 4);
      value = den !== 0 ? (num / den) : null;
    } else if (type === 7) { // Undefined
      if (count === 4) {
        value = getUint32(pos + 8);
      }
    } else if (type === 10 && count === 1) { // Signed Rational
      const absOffset = tiffStart + valueOffset;
      const num = getGlobalSInt32(absOffset);
      const den = getGlobalSInt32(absOffset + 4);
      value = den !== 0 ? (num / den) : null;
    }

    if (value !== null && value !== '') {
      switch (tag) {
        case 0x010F: // Make
          exif.camera_make = value;
          break;
        case 0x0110: // Model
          exif.camera_model = value;
          break;
        case 0x8769: // ExifIFDPointer
          // SubIFD offset is relative to TIFF header start, not current IFD
          parseSubIFD(uint8, tiffStart + valueOffset, endian, exif, getSInt32, tiffStart);
          break;
        case 0x8825: // GPS IFD Pointer
          parseGPSIFD(uint8, tiffStart + valueOffset, endian, exif, getSInt32, tiffStart);
          break;
        case 0xA434: // LensModel
          exif.lens_model = value;
          break;
        case 0x8827: // ISOSpeedRatings
          exif.iso = value;
          break;
        case 0x829D: // FNumber
          exif.aperture = formatAperture(value);
          break;
        case 0x829A: // ExposureTime
          exif.shutter_speed = formatShutter(value);
          break;
        case 0x920A: // FocalLength
          exif.focal_length = formatFocalLength(value);
          break;
        case 0x9204: // ExposureBiasValue
          exif.exposure_compensation = formatExposureCompensation(value);
          break;
        case 0x9003: // DateTimeOriginal
          exif.datetime_taken = value;
          break;
        case 0x9004: // CreateDate
          if (!exif.datetime_taken) exif.datetime_taken = value;
          break;
        case 0xA434: // LensModel
          if (!exif.lens_model) exif.lens_model = value;
          break;
      }
    }

    pos += 12;
  }
}

function parseSubIFD(uint8, offset, endian, exif, getSInt32, tiffStart) {
  const view = new DataView(uint8.buffer, offset);
  const getUint16 = (pos) => view.getUint16(pos, endian);
  const getUint32 = (pos) => view.getUint32(pos, endian);

  // Global view for reading offset-based values (valueOffset is relative to TIFF header)
  const globalView = new DataView(uint8.buffer);
  const getGlobalUint16 = (pos) => globalView.getUint16(pos, endian);
  const getGlobalUint32 = (pos) => globalView.getUint32(pos, endian);
  const getGlobalSInt32 = (pos) => globalView.getInt32(pos, endian);

  const numEntries = getUint16(0);
  let pos = 2;

  for (let i = 0; i < numEntries; i++) {
    const tag = getUint16(pos);
    const type = getUint16(pos + 2);
    const count = getUint32(pos + 4);
    const valueOffset = getUint32(pos + 8);

    let value = null;

    if (type === 2) { // ASCII string
      const dataOffset = count > 4 ? tiffStart + valueOffset : pos + 8;
      value = '';
      for (let j = 0; j < count - 1; j++) {
        const charCode = uint8[dataOffset + j];
        if (charCode >= 32 && charCode <= 126) {
          value += String.fromCharCode(charCode);
        }
      }
      value = value.trim();
    } else if (type === 3 && count === 1) { // Short
      value = getUint16(pos + 8);
    } else if (type === 4 && count === 1) { // Long
      value = getUint32(pos + 8);
    } else if (type === 5 && count === 1) { // Rational
      const absOffset = tiffStart + valueOffset;
      const num = getGlobalUint32(absOffset);
      const den = getGlobalUint32(absOffset + 4);
      value = den !== 0 ? (num / den) : null;
    } else if (type === 7 && count === 4) { // Undefined
      value = getUint32(pos + 8);
    } else if (type === 10 && count === 1) { // Signed Rational
      const absOffset = tiffStart + valueOffset;
      const num = getGlobalSInt32(absOffset);
      const den = getGlobalSInt32(absOffset + 4);
      value = den !== 0 ? (num / den) : null;
    }

    if (value !== null && value !== '') {
      switch (tag) {
        case 0x8822: // ExposureProgram
          break;
        case 0x8827: // ISOSpeedRatings
          if (!exif.iso) exif.iso = value;
          break;
        case 0x8830: // SensitivityType
          break;
        case 0x829A: // ExposureTime
          if (!exif.shutter_speed) exif.shutter_speed = formatShutter(value);
          break;
        case 0x829D: // FNumber
          if (!exif.aperture) exif.aperture = formatAperture(value);
          break;
        case 0x920A: // FocalLength
          if (!exif.focal_length) exif.focal_length = formatFocalLength(value);
          break;
        case 0x9204: // ExposureBiasValue
          if (!exif.exposure_compensation) exif.exposure_compensation = formatExposureCompensation(value);
          break;
        case 0x9003: // DateTimeOriginal
          if (!exif.datetime_taken) exif.datetime_taken = value;
          break;
        case 0x9004: // CreateDate
          if (!exif.datetime_taken) exif.datetime_taken = value;
          break;
        case 0xA434: // LensModel
          if (!exif.lens_model) exif.lens_model = value;
          break;
      }
    }

    pos += 12;
  }
}

function formatShutter(value) {
  if (value === null || value === undefined || value === '') return null;

  // If value is a rational (number), format it
  if (typeof value === 'number') {
    if (value < 1 && value > 0) {
      return `1/${Math.round(1 / value)}s`;
    }
    return `${value.toFixed(2)}s`;
  }

  // If value is a string, try to parse it
  const parts = String(value).split('/');
  if (parts.length === 2) {
    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);
    if (den !== 0 && !isNaN(num) && !isNaN(den)) {
      const result = num / den;
      if (result < 1 && result > 0) {
        return `1/${Math.round(1 / result)}s`;
      }
      return `${result.toFixed(2)}s`;
    }
  }

  // Try to parse as number
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    if (numValue < 1 && numValue > 0) {
      return `1/${Math.round(1 / numValue)}s`;
    }
    return `${numValue.toFixed(2)}s`;
  }

  return value;
}

function formatAperture(value) {
  if (value === null || value === undefined || value === '') return null;

  const num = parseFloat(value);
  if (!isNaN(num) && num > 0) {
    return `f/${num.toFixed(1)}`;
  }

  return value;
}

function formatFocalLength(value) {
  if (value === null || value === undefined || value === '') return null;

  const num = parseFloat(value);
  if (!isNaN(num) && num > 0) {
    return `${Math.round(num)}mm`;
  }

  return value;
}

function formatExposureCompensation(value) {
  if (value === null || value === undefined || value === '') return null;

  const num = parseFloat(value);
  if (!isNaN(num)) {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)} EV`;
  }

  return value;
}

function parseGPSIFD(uint8, offset, endian, exif, getSInt32, tiffStart) {
  const view = new DataView(uint8.buffer, offset);
  const getUint16 = (pos) => view.getUint16(pos, endian);
  const getUint32 = (pos) => view.getUint32(pos, endian);
  const getSInt16 = (pos) => view.getInt16(pos, endian);

  // Global view for reading offset-based values (valueOffset is relative to TIFF header)
  const globalView = new DataView(uint8.buffer);
  const getGlobalUint16 = (pos) => globalView.getUint16(pos, endian);
  const getGlobalUint32 = (pos) => globalView.getUint32(pos, endian);
  const getGlobalSInt32 = (pos) => globalView.getInt32(pos, endian);

  const numEntries = getUint16(0);
  let pos = 2;

  let latitude = null;
  let latitudeRef = null;
  let longitude = null;
  let longitudeRef = null;
  let altitude = null;
  let altitudeRef = null;

  for (let i = 0; i < numEntries; i++) {
    const tag = getUint16(pos);
    const type = getUint16(pos + 2);
    const count = getUint32(pos + 4);
    const valueOffset = getUint32(pos + 8);

    let value = null;

    if (type === 2) { // ASCII string
      const dataOffset = count > 4 ? tiffStart + valueOffset : pos + 8;
      value = '';
      for (let j = 0; j < count - 1; j++) {
        const charCode = uint8[dataOffset + j];
        if (charCode >= 32 && charCode <= 126) {
          value += String.fromCharCode(charCode);
        }
      }
      value = value.trim();
    } else if (type === 3 && count === 1) { // Short
      value = getUint16(pos + 8);
    } else if (type === 4 && count === 1) { // Long
      value = getUint32(pos + 8);
    } else if (type === 5) { // Rational array
      const absOffset = tiffStart + valueOffset;
      const coords = [];
      for (let j = 0; j < count; j++) {
        const num = getGlobalUint32(absOffset + j * 8);
        const den = getGlobalUint32(absOffset + j * 8 + 4);
        coords.push(den !== 0 ? num / den : 0);
      }
      value = coords;
    } else if (type === 7 && count === 1) { // Undefined (single byte)
      value = uint8[pos + 8];
    } else if (type === 10 && count === 1) { // Signed Rational
      const absOffset = tiffStart + valueOffset;
      const num = getGlobalSInt32(absOffset);
      const den = getGlobalSInt32(absOffset + 4);
      value = den !== 0 ? (num / den) : null;
    }

    switch (tag) {
      case 0x0001: // GPSLatitudeRef
        latitudeRef = value;
        break;
      case 0x0002: // GPSLatitude
        latitude = value;
        break;
      case 0x0003: // GPSLongitudeRef
        longitudeRef = value;
        break;
      case 0x0004: // GPSLongitude
        longitude = value;
        break;
      case 0x0005: // GPSAltitudeRef
        altitudeRef = value;
        break;
      case 0x0006: // GPSAltitude
        altitude = value;
        break;
    }

    pos += 12;
  }

  // Convert GPS coordinates to decimal format
  if (latitude && latitude.length === 3 && latitudeRef) {
    exif.gps_latitude = convertDMSToDD(latitude, latitudeRef);
  }

  if (longitude && longitude.length === 3 && longitudeRef) {
    exif.gps_longitude = convertDMSToDD(longitude, longitudeRef);
  }
}

function convertDMSToDD(dms, ref) {
  // dms is an array [degrees, minutes, seconds]
  // ref is 'N', 'S', 'E', or 'W'
  const degrees = dms[0];
  const minutes = dms[1];
  const seconds = dms[2];

  let dd = degrees + minutes / 60 + seconds / 3600;

  if (ref === 'S' || ref === 'W') {
    dd = dd * -1;
  }

  // Round to 6 decimal places
  return Math.round(dd * 1000000) / 1000000;
}

function formatGPSCoordinate(lat, lng) {
  if (lat === null || lng === null) return null;

  const latRef = lat >= 0 ? 'N' : 'S';
  const lngRef = lng >= 0 ? 'E' : 'W';

  const absLat = Math.abs(lat);
  const absLng = Math.abs(lng);

  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = ((absLat - latDeg - latMin / 60) * 3600);

  const lngDeg = Math.floor(absLng);
  const lngMin = Math.floor((absLng - lngDeg) * 60);
  const lngSec = ((absLng - lngDeg - lngMin / 60) * 3600);

  return `${latDeg}°${latMin}'${latSec.toFixed(4)}" ${latRef}, ${lngDeg}°${lngMin}'${lngSec.toFixed(4)}" ${lngRef}`;
}

// ===== Static Routes (Serve from Assets) =====
router.get('/', async (request, env) => {
  const html = await env.ASSETS.fetch(new URL('/index.html', request.url));
  if (!html.ok) return new Response('Not Found', { status: 404 });
  return new Response(html.body, html);
});

router.get('/index.html', async (request, env) => {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return new Response('Not Found', { status: 404 });
  return new Response(response.body, {
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});

router.get('/styles.css', async (request, env) => {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return new Response('Not Found', { status: 404 });
  return new Response(response.body, {
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});

router.get('/app.js', async (request, env) => {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return new Response('Not Found', { status: 404 });
  return new Response(response.body, {
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});

router.get('/about.html', async (request, env) => {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return new Response('Not Found', { status: 404 });
  return new Response(response.body, {
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});

// ===== Public API Routes ===== (Must be before /photos/* route)

// Initialize database (run migrations)
router.post('/api/admin/init', async (request, env) => {
  try {
    // Check if already initialized by checking if users table exists and has data
    try {
      await env.DB.prepare('SELECT id FROM users LIMIT 1').first();
      const user = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
      if (user && user.count > 0) {
        return Response.json({ error: 'Database already initialized' }, { status: 400 });
      }
    } catch (e) {
      // Table doesn't exist, proceed with initialization
    }

    // Run migrations
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          filename TEXT NOT NULL,
          r2_key TEXT NOT NULL,
          width INTEGER,
          height INTEGER,
          file_size INTEGER,
          mime_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER NOT NULL,
          camera_make TEXT,
          camera_model TEXT,
          lens_model TEXT,
          iso INTEGER,
          aperture TEXT,
          shutter_speed TEXT,
          focal_length TEXT,
          exposure_compensation TEXT,
          datetime_taken TEXT,
          gps_latitude REAL,
          gps_longitude REAL,
          layout_x INTEGER DEFAULT 0,
          layout_y INTEGER DEFAULT 0,
          layout_width INTEGER DEFAULT 250,
          layout_height INTEGER DEFAULT 250,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS collections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collection_photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          collection_id INTEGER NOT NULL,
          photo_id INTEGER NOT NULL,
          sort_order INTEGER DEFAULT 0,
          FOREIGN KEY (collection_id) REFERENCES collections(id),
          FOREIGN KEY (photo_id) REFERENCES photos(id)
      );

      CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_photos_user ON photos(user_id);
      CREATE INDEX IF NOT EXISTS idx_photos_created ON photos(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_collection_photos_collection ON collection_photos(collection_id, sort_order);
    `);

    return Response.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Init error:', error);
    return Response.json({ error: 'Initialization failed' }, { status: 500 });
  }
});

router.get('/api/health', async (request, env) => {
  try {
    // Check if users table exists and has at least one user
    await env.DB.prepare('SELECT id FROM users LIMIT 1').first();
    const user = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const hasUsers = user && user.count > 0;
    const initialized = hasUsers;

    return Response.json({
      status: 'ok',
      timestamp: Date.now(),
      initialized,
    });
  } catch (error) {
    // Table doesn't exist
    return Response.json({
      status: 'ok',
      timestamp: Date.now(),
      initialized: false,
    });
  }
});

router.post('/api/admin/setup', async (request, env) => {
  try {
    const { username, password } = await request.json();

    // Check if already initialized (has users)
    const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();

    if (userCount && userCount.count > 0) {
      return Response.json({ error: 'Admin already exists' }, { status: 400 });
    }

    // Validate inputs
    if (!username || username.trim().length === 0) {
      return Response.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await env.DB.prepare(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    ).bind(username.trim(), passwordHash).run();

    if (!result.success) {
      return Response.json({ error: 'Failed to create admin' }, { status: 500 });
    }

    // Auto-generate session token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await env.DB.prepare(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
    ).bind(result.meta.last_row_id, token, expiresAt.toISOString()).run();

    return Response.json({
      token,
      user: { id: result.meta.last_row_id, username: username.trim() },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return Response.json({ error: 'Setup failed' }, { status: 500 });
  }
});

router.get('/api/photos', async (request, env) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const { results } = await env.DB.prepare(
    `SELECT id, title, description, filename, r2_key,
       width as exif_width, height as exif_height, created_at,
       camera_make, camera_model, lens_model, iso, aperture, shutter_speed, focal_length,
       exposure_compensation, datetime_taken, gps_latitude, gps_longitude
     FROM photos
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(limit, offset).all();

  const { results: countResult } = await env.DB.prepare(
    'SELECT COUNT(*) as total FROM photos'
  ).all();

  return Response.json({
    photos: results || [],
    pagination: {
      page,
      limit,
      total: countResult[0]?.total || 0,
      totalPages: Math.ceil((countResult[0]?.total || 0) / limit),
    },
  });
});

router.get('/api/photos/:id', async (request, env) => {
  const { id } = request.params;

  const photo = await env.DB.prepare(
    `SELECT p.id, p.title, p.description, p.filename, p.r2_key,
       p.width as exif_width, p.height as exif_height, p.created_at,
       p.camera_make, p.camera_model, p.lens_model, p.iso, p.aperture, p.shutter_speed, p.focal_length,
       p.exposure_compensation, p.datetime_taken, p.gps_latitude, p.gps_longitude,
       p.layout_x, p.layout_y, p.layout_width, p.layout_height,
       cp.collection_id
     FROM photos p
     LEFT JOIN collection_photos cp ON p.id = cp.photo_id
     WHERE p.id = ?`
  ).bind(id).first();

  if (!photo) {
    return Response.json({ error: 'Photo not found' }, { status: 404 });
  }

  return Response.json(photo);
});

router.get('/api/collections', async (request, env) => {
  const { results } = await env.DB.prepare(
    `SELECT c.*, COUNT(cp.photo_id) as photo_count
     FROM collections c
     LEFT JOIN collection_photos cp ON c.id = cp.collection_id
     GROUP BY c.id
     ORDER BY c.created_at DESC`
  ).all();

  return Response.json({ collections: results || [] });
});

router.get('/api/collections/:id', async (request, env) => {
  const { id } = request.params;

  const collection = await env.DB.prepare(
    'SELECT c.*, COUNT(cp.photo_id) as photo_count FROM collections c LEFT JOIN collection_photos cp ON c.id = cp.collection_id WHERE c.id = ? GROUP BY c.id'
  ).bind(id).first();

  return Response.json({ collection: collection || {} });
});

router.get('/api/collections/:id/photos', async (request, env) => {
  const { id } = request.params;

  const { results } = await env.DB.prepare(
    `SELECT p.id, p.title, p.description, p.filename, p.r2_key,
       p.width as exif_width, p.height as exif_height, p.created_at, cp.sort_order,
       p.camera_make, p.camera_model, p.lens_model, p.iso, p.aperture, p.shutter_speed, p.focal_length,
       p.exposure_compensation, p.datetime_taken, p.gps_latitude, p.gps_longitude,
       p.layout_x, p.layout_y, p.layout_width, p.layout_height
     FROM photos p
     JOIN collection_photos cp ON p.id = cp.photo_id
     WHERE cp.collection_id = ?
     ORDER BY cp.sort_order ASC`
  ).bind(id).all();

  return Response.json({ photos: results || [] });
});

// Serve admin page
router.get('/admin', async (request, env) => {
  const html = await env.ASSETS.fetch(new URL('/admin.html', request.url));
  if (!html.ok) return new Response('Not Found', { status: 404 });
  return new Response(html.body, html);
});

router.get('/admin.html', async (request, env) => {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return new Response('Not Found', { status: 404 });
  return new Response(response.body, {
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});

router.get('/admin.css', async (request, env) => {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return new Response('Not Found', { status: 404 });
  return new Response(response.body, {
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});

router.get('/admin.js', async (request, env) => {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return new Response('Not Found', { status: 404 });
  return new Response(response.body, {
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});

// Serve photos from R2 (Must be after all API routes)
router.get('/photos/*', async (request, env) => {
  const url = new URL(request.url);
  const key = url.pathname.substring(1);

  const object = await env.R2.get(key);
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

// Serve thumbnails from R2 (direct path)
router.get('/thumbnails/*', async (request, env) => {
  const url = new URL(request.url);
  const key = url.pathname.substring(1);

  const object = await env.R2.get(key);
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

// ===== Auth Routes =====

router.post('/api/auth/login', async (request, env) => {
  try {
    const { username, password } = await request.json();

    const user = await env.DB.prepare(
      'SELECT id, username, password_hash FROM users WHERE username = ?'
    ).bind(username).first();

    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await env.DB.prepare(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
    ).bind(user.id, token, expiresAt.toISOString()).run();

    return Response.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
});

router.post('/api/auth/logout', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authHeader = request.headers.get('Authorization');
  const token = authHeader.substring(7);

  await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();

  return Response.json({ message: 'Logged out successfully' });
});

router.get('/api/auth/me', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await env.DB.prepare(
    'SELECT id, username FROM users WHERE id = ?'
  ).bind(session.user_id).first();

  return Response.json({ user });
});

// ===== Admin Routes =====

router.post('/api/admin/photos', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title') || 'Untitled';
    const description = formData.get('description') || '';
    const collectionId = formData.get('collection_id');

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const mimeType = file.type || 'image/jpeg';

    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
    const r2Key = `photos/${filename}`;
    const thumbnailR2Key = `thumbnails/${filename}`;

    // Upload original photo
    await env.R2.put(r2Key, bytes, {
      httpMetadata: { contentType: mimeType }
    });

    let width = null;
    let height = null;

    if (bytes.byteLength > 2) {
      const uint8 = new Uint8Array(bytes);
      if (uint8[0] === 0x89 && uint8[1] === 0x50 && bytes.byteLength >= 24) {
        const view = new DataView(bytes);
        width = view.getUint32(16, false);
        height = view.getUint32(20, false);
      }
    }

    // Parse EXIF data
    const exif = parseEXIF(bytes);
    console.log('Parsed EXIF:', JSON.stringify(exif));

    // Get thumbnail from form data (uploaded by client)
    const thumbnailFile = formData.get('thumbnail');

    if (thumbnailFile) {
      const thumbnailBytes = await thumbnailFile.arrayBuffer();
      await env.R2.put(thumbnailR2Key, thumbnailBytes, {
        httpMetadata: { contentType: 'image/jpeg' }
      });
      console.log(`Client-uploaded thumbnail saved: ${thumbnailR2Key} (${thumbnailBytes.byteLength} bytes)`);
    } else {
      console.log('No thumbnail provided by client, using original file for thumbnail');
      // Fallback: use original as thumbnail
      await env.R2.put(thumbnailR2Key, bytes, {
        httpMetadata: { contentType: mimeType }
      });
    }

    const result = await env.DB.prepare(
      `INSERT INTO photos (title, description, filename, r2_key, width, height, file_size, mime_type, user_id,
         camera_make, camera_model, lens_model, iso, aperture, shutter_speed, focal_length,
         exposure_compensation, datetime_taken, gps_latitude, gps_longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(title, description, filename, r2Key, width, height, bytes.byteLength, mimeType, session.user_id,
           exif.camera_make, exif.camera_model, exif.lens_model, exif.iso, exif.aperture,
           exif.shutter_speed, exif.focal_length, exif.exposure_compensation,
           exif.datetime_taken, exif.gps_latitude, exif.gps_longitude)
      .run();

    if (!result.success) {
      return Response.json({ error: 'Failed to save photo' }, { status: 500 });
    }

    const photoId = result.meta.last_row_id;

    if (collectionId) {
      await env.DB.prepare(
        'INSERT INTO collection_photos (collection_id, photo_id, sort_order) VALUES (?, ?, 0)'
      ).bind(collectionId, photoId).run();
    }

    return Response.json({
      message: 'Photo uploaded successfully',
      photoId,
      filename,
      r2Key,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
});

router.put('/api/admin/photos/:id', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = request.params;
    const { title, description, sort_order, layout_x, layout_y, layout_width, layout_height, collection_id } = await request.json();

    // Update photos table
    let photoQuery = 'UPDATE photos SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP';
    let photoParams = [title, description];

    if (layout_x !== undefined) {
      photoQuery += ', layout_x = ?, layout_y = ?, layout_width = ?, layout_height = ?';
      photoParams.push(layout_x, layout_y, layout_width, layout_height);
    }

    photoQuery += ' WHERE id = ?';
    photoParams.push(id);

    await env.DB.prepare(photoQuery).bind(...photoParams).run();

    // Update collection_photos table
    if (collection_id !== undefined) {
      // First, remove photo from all collections
      await env.DB.prepare('DELETE FROM collection_photos WHERE photo_id = ?').bind(id).run();

      // If collection_id is not null, add photo to that collection
      if (collection_id !== null) {
        const sortOrder = sort_order !== undefined ? sort_order : 0;
        await env.DB.prepare(
          'INSERT INTO collection_photos (collection_id, photo_id, sort_order) VALUES (?, ?, ?)'
        ).bind(collection_id, id, sortOrder).run();
      }
    }

    return Response.json({ message: 'Photo updated successfully' });
  } catch (error) {
    console.error('Update photo error:', error);
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
});

router.delete('/api/admin/photos/:id', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = request.params;

    const photo = await env.DB.prepare(
      'SELECT r2_key FROM photos WHERE id = ?'
    ).bind(id).first();

    if (!photo) {
      return Response.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete collection-photo associations first (due to foreign key constraint)
    await env.DB.prepare('DELETE FROM collection_photos WHERE photo_id = ?').bind(id).run();

    // Delete photo record
    await env.DB.prepare('DELETE FROM photos WHERE id = ?').bind(id).run();

    // Delete R2 files last (after database operations succeed)
    await env.R2.delete(photo.r2_key);

    // Delete thumbnail if exists (same filename but in /thumbnails/ folder)
    const thumbnailKey = photo.r2_key.replace('/photos/', '/thumbnails/');
    await env.R2.delete(thumbnailKey);

    return Response.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
});

router.post('/api/admin/collections', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    const result = await env.DB.prepare(
      'INSERT INTO collections (name, description) VALUES (?, ?)'
    ).bind(name, description).run();

    if (!result.success) {
      return Response.json({ error: 'Failed to create collection' }, { status: 500 });
    }

    return Response.json({ message: 'Collection created successfully' });
  } catch (error) {
    return Response.json({ error: 'Create failed' }, { status: 500 });
  }
});

router.put('/api/admin/collections/:id', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = request.params;
    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if collection exists
    const existing = await env.DB.prepare('SELECT id FROM collections WHERE id = ?').bind(id).first();
    if (!existing) {
      return Response.json({ error: 'Collection not found' }, { status: 404 });
    }

    const result = await env.DB.prepare(
      'UPDATE collections SET name = ?, description = ? WHERE id = ?'
    ).bind(name.trim(), description || '', id).run();

    if (!result.success || result.meta.changes === 0) {
      return Response.json({ error: 'Failed to update collection' }, { status: 500 });
    }

    return Response.json({ 
      message: 'Collection updated successfully',
      id: id,
      name: name.trim(),
      description: description || ''
    });
  } catch (error) {
    console.error('Update collection error:', error);
    return Response.json({ error: 'Update failed: ' + error.message }, { status: 500 });
  }
});

router.delete('/api/admin/collections/:id', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = request.params;

    // Get all photos in this collection
    const { results: collectionPhotos } = await env.DB.prepare(
      'SELECT photo_id FROM collection_photos WHERE collection_id = ?'
    ).bind(id).all();

    // Check if collection has photos
    if (collectionPhotos.length > 0) {
      return Response.json({
        error: 'Cannot delete collection with photos',
        message: `Please remove all ${collectionPhotos.length} photo(s) from this collection before deleting it`
      }, { status: 400 });
    }

    // Delete collection-photo associations
    await env.DB.prepare('DELETE FROM collection_photos WHERE collection_id = ?').bind(id).run();

    // Delete collection itself
    await env.DB.prepare('DELETE FROM collections WHERE id = ?').bind(id).run();

    return Response.json({
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
});

router.get('/api/admin/stats', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { results: photoStats } = await env.DB.prepare(
    'SELECT COUNT(*) as total, SUM(file_size) as totalSize FROM photos'
  ).all();

  const { results: collectionStats } = await env.DB.prepare(
    'SELECT COUNT(*) as total FROM collections'
  ).all();

  return Response.json({
    photos: photoStats[0] || { total: 0, totalSize: 0 },
    collections: collectionStats[0] || { total: 0 },
  });
});

router.put('/api/admin/change-password', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    // Get current user
    const user = await env.DB.prepare(
      'SELECT id, username, password_hash FROM users WHERE id = ?'
    ).bind(session.user_id).first();

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await env.DB.prepare(
      'UPDATE users SET password_hash = ? WHERE id = ?'
    ).bind(newPasswordHash, user.id).run();

    return Response.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return Response.json({ error: 'Failed to change password' }, { status: 500 });
  }
});

// ===== Site Settings Routes =====

router.get('/api/site-settings', async (request, env) => {
  try {
    const settings = await env.DB.prepare(
      'SELECT title, logo, author_name, contact, about, icp_number, show_icp, welcome_message FROM site_settings WHERE id = 1'
    ).first();

    return Response.json({ settings: settings || {} }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Get site settings error:', error);
    return Response.json({ error: 'Failed to get site settings' }, { status: 500 });
  }
});

router.put('/api/admin/site-settings', async (request, env) => {
  const session = await requireAuth(request, env);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, logo, author_name, contact, about, icp_number, show_icp, welcome_message } = body;
    const showIcpInt = show_icp ? 1 : 0;

    // Update or insert settings
    const existing = await env.DB.prepare('SELECT id FROM site_settings WHERE id = 1').first();

    if (existing) {
      await env.DB.prepare(
        'UPDATE site_settings SET title = ?, logo = ?, author_name = ?, contact = ?, about = ?, icp_number = ?, show_icp = ?, welcome_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1'
      ).bind(title, logo, author_name, contact, about, icp_number, showIcpInt, welcome_message || 'HELLO!').run();
    } else {
      await env.DB.prepare(
        'INSERT INTO site_settings (title, logo, author_name, contact, about, icp_number, show_icp, welcome_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(title, logo, author_name, contact, about, icp_number, showIcpInt, welcome_message || 'HELLO!').run();
    }

    return Response.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update site settings error:', error);
    return Response.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
});

// CORS
router.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});

router.all('*', () => {
  return new Response('Not Found', { status: 404 });
});

export default {
  async fetch(request, env, ctx) {
    const response = await router.handle(request, env, ctx);

    // Only add CORS headers if not already present (for OPTIONS requests)
    if (!response.headers.has('Access-Control-Allow-Origin')) {
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
  },
};
