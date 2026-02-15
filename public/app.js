// ===== API Configuration =====
const API_BASE = '/api';

// ===== State =====
let currentPage = 1;
let currentToken = localStorage.getItem('authToken');
let photos = [];
let currentCollectionId = null; // Track current collection view
let currentTab = 'gallery';
let currentLang = localStorage.getItem('currentLang') || 'en';
let siteSettings = {};
let currentModalPhotoId = null; // Track current photo in modal

// ===== Language Translations =====
const translations = {
    zh: {
        collections: '相册',
        gallery: '照片',
        contact: '联系方式',
        about: '关于',
        author: '作者',
        authorLabel: '作者：',
        contactLabel: '联系方式：',
        loadMore: '查看更多',
        loading: '加载中...',
        noPhotos: '暂无照片',
        noCollections: '暂无相册',
        uploadFirstPhoto: '上传你的第一张照片开始创作',
        loadFailed: '加载失败',
        retryLater: '请稍后重试',
        login: '登录',
        logout: '退出登录',
        manageLogin: '管理登录',
        manageAdmin: '管理后台',
        copyright: '© 2024 ',
        loginSuccess: '登录成功',
        logoutSuccess: '已退出登录',
        contactInfo: '联系方式',
        exifTitle: '照片信息',
        exifCamera: '相机',
        exifLens: '镜头',
        exifISO: 'ISO',
        exifAperture: '光圈',
        exifShutter: '快门',
        exifFocal: '焦距',
        exifDate: '拍摄时间',
        returnToAdmin: '← 返回管理继续编辑',
        deletePhoto: '删除照片',
        deleteConfirm: '确认删除这张照片？',
        deleteSuccess: '照片已删除',
        deleteFailed: '删除失败'
    },
    en: {
        collections: 'Albums',
        gallery: 'Gallery',
        contact: 'Contact',
        about: 'About',
        author: 'Author',
        authorLabel: 'Author: ',
        contactLabel: 'Contact: ',
        loadMore: 'Load More',
        loading: 'Loading...',
        noPhotos: 'No Photos',
        noCollections: 'No Albums',
        uploadFirstPhoto: 'Upload your first photo to start',
        loadFailed: 'Loading Failed',
        retryLater: 'Please try again later',
        login: 'Login',
        logout: 'Logout',
        manageLogin: 'Admin Login',
        manageAdmin: 'Admin Panel',
        copyright: '© 2024 ',
        loginSuccess: 'Login Successful',
        logoutSuccess: 'Logged Out',
        contactInfo: 'Contact Information',
        exifTitle: 'Photo Info',
        exifCamera: 'Camera',
        exifLens: 'Lens',
        exifISO: 'ISO',
        exifAperture: 'Aperture',
        exifShutter: 'Shutter',
        exifFocal: 'Focal Length',
        exifDate: 'Date Taken',
        returnToAdmin: '← Return to Admin',
        deletePhoto: 'Delete Photo',
        deleteConfirm: 'Delete this photo?',
        deleteSuccess: 'Photo deleted',
        deleteFailed: 'Delete failed'
    }
};

// ===== DOM Elements =====
const photoGrid = document.getElementById('photoGrid');
const collectionsGrid = document.getElementById('collectionsGrid');
const sidebarCollections = document.getElementById('sidebarCollections');
const loadMoreBtn = document.querySelector('#loadMore .btn');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const photoModal = document.getElementById('photoModal');

const siteLogo = document.getElementById('siteLogo');
const footerCopyright = document.getElementById('footerCopyright');
const aboutTitle = document.getElementById('aboutTitle');
const langToggle = document.getElementById('langToggle');
const langLabel = document.getElementById('langLabel');
const collectionsTitle = document.getElementById('collectionsTitle');
const galleryTab = document.getElementById('galleryTab');
const aboutTab = document.getElementById('aboutTab');
const contactTitle = document.getElementById('contactTitle');
const contactIcon = document.getElementById('contactIcon');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// ===== Utility Functions =====
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
};

const apiRequest = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    // Add timestamp to prevent caching for GET requests
    let url = `${API_BASE}${endpoint}`;
    if (!options.method || options.method === 'GET') {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}_t=${Date.now()}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle 304 Not Modified - retry with fresh request
    if (response.status === 304) {
        console.log('Received 304, retrying without cache...');
        // Retry with cache-busting headers
        const retryHeaders = {
            ...headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        };
        const retryUrl = `${API_BASE}${endpoint}`;
        const separator = retryUrl.includes('?') ? '&' : '?';
        const retryResponse = await fetch(`${retryUrl}${separator}_force_refresh=${Date.now()}`, {
            ...options,
            headers: retryHeaders,
        });

        if (!retryResponse.ok) {
            let errorMessage = `HTTP error! status: ${retryResponse.status}`;
            try {
                const errorData = await retryResponse.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                errorMessage = retryResponse.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return retryResponse.json();
    }

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
            errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
    }

    return response.json();
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();

    // Check if returning from admin preview
    const returnToAdmin = sessionStorage.getItem('returnToAdmin');
    if (returnToAdmin === 'true') {
        sessionStorage.removeItem('returnToAdmin');

        // Add return to admin button
        const gallerySection = document.getElementById('gallerySection');
        if (gallerySection) {
            const returnBtn = document.createElement('button');
            returnBtn.className = 'btn btn-secondary return-to-admin';
            const t = translations[currentLang];
            returnBtn.textContent = t.returnToAdmin;
            returnBtn.style.marginBottom = '1.5rem';
            returnBtn.addEventListener('click', () => {
                const previewCollectionId = sessionStorage.getItem('previewCollectionId');
                sessionStorage.removeItem('previewCollectionId');
                window.location.href = previewCollectionId ? `/admin.html?collection=${previewCollectionId}` : '/admin.html';
            });
            gallerySection.insertBefore(returnBtn, gallerySection.firstChild);
        }
    }

    // Initialize language first
    updateLanguageUI();

    loadSiteSettings();
    loadCollections();

    // Load photos - check URL for collection parameter
    const urlParams = new URLSearchParams(window.location.search);
    const collectionParam = urlParams.get('collection');

    if (collectionParam) {
        // Wait for collections to load, then view the specific collection
        setTimeout(() => {
            const collectionId = parseInt(collectionParam, 10);
            if (!isNaN(collectionId)) {
                viewCollection(collectionId);
            } else {
                loadPhotos();
            }
        }, 500);
    } else {
        loadPhotos();
    }

    checkAuth();

    // Set initial active state for "gallery" tab
    const galleryTabElement = document.querySelector('.sidebar-link[data-tab="gallery"]');
    if (galleryTabElement) {
        galleryTabElement.classList.add('active');
    }
});

function setupEventListeners() {
    // Close sidebar when clicking on a link
    document.querySelectorAll('.sidebar-link, .sidebar-collection-link').forEach(link => {
        link.addEventListener('click', (e) => {
            // Handle tab navigation
            const tab = link.dataset.tab;
            if (tab) {
                e.preventDefault();
                handleTabSwitch(tab);
            }
        });
    });

    // Close modals
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Login button - redirect to admin panel on click
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (currentToken) {
                // Redirect to admin panel
                window.location.href = '/admin.html';
            } else {
                if (loginModal) loginModal.classList.add('active');
            }
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }





    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            loadPhotos(true);
        });
    }



    // Language toggle
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

    // Contact icon - navigate to contact section
    if (contactIcon) {
        contactIcon.addEventListener('click', () => {
            handleTabSwitch('contact');
        });
    }

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Sidebar overlay - close menu when clicked
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileMenu);
    }

    // Window resize - adjust canvas scaling
    window.addEventListener('resize', () => {
        scaleCanvasToFit();
    });

    // Delete photo button
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    if (deletePhotoBtn) {
        deletePhotoBtn.addEventListener('click', handleDeletePhoto);
    }

    // Tab switching (handled above)
}

// ===== Auth Functions =====
async function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (!usernameInput || !passwordInput) {
        const t = translations[currentLang];
        showToast(t.loadFailed === '加载失败' ? '表单错误' : 'Form error', 'error');
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        currentToken = data.token;
        localStorage.setItem('authToken', data.token);

        if (loginModal) loginModal.classList.remove('active');
        showToast(currentLang === 'zh' ? '登录成功' : 'Login successful');
        checkAuth();
        // Redirect to admin panel after successful login
        setTimeout(() => {
            window.location.href = '/admin.html';
        }, 1000);
    } catch (error) {
        showToast(currentLang === 'zh' ? '登录失败，请检查用户名和密码' : 'Login failed, please check username and password', 'error');
    }
}

async function handleLogout() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }

    currentToken = null;
    localStorage.removeItem('authToken');
    const t = translations[currentLang];
    showToast(t.logoutSuccess);
}

function checkAuth() {
    if (!loginBtn) return;

    const t = translations[currentLang];
    const adminLink = document.getElementById('adminLink');

    if (currentToken) {
        loginBtn.textContent = t.manageLogin;
        loginBtn.style.display = '';
        loginBtn.style.opacity = '0.4';

        if (adminLink) {
            adminLink.textContent = t.manageAdmin;
            adminLink.classList.remove('hidden');
        }
    } else {
        loginBtn.textContent = t.manageLogin;
        loginBtn.style.display = '';
        loginBtn.style.opacity = '0.4';

        if (adminLink) {
            adminLink.classList.add('hidden');
        }
    }
}

// ===== Tab Navigation =====
function handleTabSwitch(tab) {
    currentTab = tab;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.tab === tab);
    });

    // Show/hide sections
    const gallerySection = document.getElementById('gallerySection');
    const aboutSection = document.getElementById('aboutSection');
    const contactSection = document.getElementById('contactSection');

    gallerySection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    contactSection.classList.add('hidden');

    if (tab === 'gallery') {
        gallerySection.classList.remove('hidden');
    } else if (tab === 'about') {
        aboutSection.classList.remove('hidden');
        loadAboutContent();
    } else if (tab === 'contact') {
        contactSection.classList.remove('hidden');
        loadContactContent();
    }

    // Close mobile menu after switching tabs
    closeMobileMenu();
}

// ===== Mobile Menu =====
function toggleMobileMenu() {
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
    if (sidebarOverlay) {
        sidebarOverlay.classList.toggle('active');
    }
}

function closeMobileMenu() {
    if (sidebar) {
        sidebar.classList.remove('active');
    }
    if (sidebarOverlay) {
        sidebarOverlay.classList.remove('active');
    }
}

// ===== Language Switching =====
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('currentLang', currentLang);
    updateLanguageUI();

    // Re-render photos to update empty state messages and load more button
    if (currentTab === 'gallery' && photoGrid) {
        if (currentCollectionId) {
            renderPhotosWithLayout();
        } else {
            renderPhotos();
        }
    }
}

function updateLanguageUI() {
    const t = translations[currentLang];

    // Update language toggle button
    if (langLabel) {
        langLabel.textContent = currentLang === 'zh' ? 'EN' : '中文';
    }

    // Update sidebar links
    if (collectionsTitle) {
        collectionsTitle.textContent = t.collections;
    }
    if (galleryTab) {
        galleryTab.textContent = t.gallery;
    }
    if (aboutTab) {
        aboutTab.textContent = t.about;
    }

    // Update load more button
    if (loadMoreBtn) {
        loadMoreBtn.textContent = t.loadMore;
    }

    // Update footer and login button
    checkAuth();

    // Update document title
    document.title = (siteSettings.title || 'PhotoBlog') + (currentLang === 'zh' ? ' - 摄影作品集' : ' - Photo Gallery');

    // Update section titles
    if (currentTab === 'about' && aboutTitle) {
        aboutTitle.textContent = t.about + ' ' + (siteSettings.title || 'PhotoBlog');
    } else if (currentTab === 'contact' && contactTitle) {
        contactTitle.textContent = t.contact;
    }

    // Update EXIF labels
    const exifTitle = document.getElementById('exifTitle');
    const exifCameraLabel = document.getElementById('exifCameraLabel');
    const exifLensLabel = document.getElementById('exifLensLabel');
    const exifISOLabel = document.getElementById('exifISOLabel');
    const exifApertureLabel = document.getElementById('exifApertureLabel');
    const exifShutterLabel = document.getElementById('exifShutterLabel');
    const exifFocalLabel = document.getElementById('exifFocalLabel');
    const exifDateLabel = document.getElementById('exifDateLabel');

    if (exifTitle) exifTitle.textContent = t.exifTitle;
    if (exifCameraLabel) exifCameraLabel.textContent = t.exifCamera;
    if (exifLensLabel) exifLensLabel.textContent = t.exifLens;
    if (exifISOLabel) exifISOLabel.textContent = t.exifISO;
    if (exifApertureLabel) exifApertureLabel.textContent = t.exifAperture;
    if (exifShutterLabel) exifShutterLabel.textContent = t.exifShutter;
    if (exifFocalLabel) exifFocalLabel.textContent = t.exifFocal;
    if (exifDateLabel) exifDateLabel.textContent = t.exifDate;

    // Update login modal
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        const loginModalTitle = loginModal.querySelector('h2');
        const usernameLabel = loginModal.querySelector('label[for="username"]');
        const passwordLabel = loginModal.querySelector('label[for="password"]');
        const loginSubmitBtn = loginModal.querySelector('button[type="submit"]');

        if (loginModalTitle) loginModalTitle.textContent = t.login;
        if (usernameLabel) usernameLabel.textContent = currentLang === 'zh' ? '用户名' : 'Username';
        if (passwordLabel) passwordLabel.textContent = currentLang === 'zh' ? '密码' : 'Password';
        if (loginSubmitBtn) loginSubmitBtn.textContent = t.login;
    }

    // Update sidebar collections
    loadCollections();

    // Re-render photos if viewing gallery
    if (currentTab === 'gallery' && photos.length > 0) {
        renderPhotos();
    }

    // Reload about or contact content if viewing those tabs
    if (currentTab === 'about') {
        loadAboutContent();
    } else if (currentTab === 'contact') {
        loadContactContent();
    }
}

// ===== Site Settings =====
async function loadSiteSettings() {
    try {
        const data = await apiRequest('/site-settings');
        siteSettings = data.settings || {};
        updateSiteUI();
    } catch (error) {
        console.error('Failed to load site settings:', error);
        // Use default values
        const t = translations[currentLang];
        siteSettings = {
            title: 'PhotoBlog',
            logo: 'LINTHU',
            author_name: 'Lin',
            contact: 'DPICW_WY@163.com',
            about: t.gallery + ' Gallery System'
        };
        updateSiteUI();
    }
}

function updateSiteUI() {
    const t = translations[currentLang];

    // Update title
    document.title = siteSettings.title || (currentLang === 'zh' ? '摄影作品集' : 'Photo Gallery');

    // Update logo
    if (siteLogo) {
        siteLogo.textContent = siteSettings.logo || (currentLang === 'zh' ? '摄影作品集' : 'Photo Gallery');
    }

    // Update footer copyright
    if (footerCopyright) {
        footerCopyright.textContent = siteSettings.title || (currentLang === 'zh' ? '摄影作品集' : 'Photo Gallery');
    }

    // Update current year
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // Update ICP display
    const icpDisplay = document.getElementById('icpDisplay');
    if (icpDisplay) {
        if (siteSettings.show_icp && siteSettings.icp_number) {
            icpDisplay.textContent = siteSettings.icp_number;
            icpDisplay.classList.remove('hidden');
        } else {
            icpDisplay.classList.add('hidden');
        }
    }

    // Update about title
    if (aboutTitle) {
        aboutTitle.textContent = t.about + ' ' + (siteSettings.title || (currentLang === 'zh' ? '摄影作品集' : 'Photo Gallery'));
    }

    // Update welcome message
    updateCollectionHeader();
}

async function loadAboutContent() {
    const aboutContent = document.getElementById('aboutContent');
    if (!aboutContent) return;

    const t = translations[currentLang];

    try {
        const data = await apiRequest('/site-settings');
        const settings = data.settings || {};

        aboutContent.innerHTML = `
            <div style="line-height: 2; color: var(--text-secondary);">
                <p><strong>${t.authorLabel}</strong>${settings.author_name || '-'}</p>
                <p style="margin-top: 2rem;">${settings.about || '-'}</p>
            </div>
        `;

        // Update about title
        if (aboutTitle) {
            aboutTitle.textContent = t.about + ' ' + (siteSettings.title || 'PhotoBlog');
        }
    } catch (error) {
        console.error('Failed to load about content:', error);
        aboutContent.innerHTML = `
            <p>${t.loadFailed}</p>
        `;
    }
}

async function loadContactContent() {
    const contactContent = document.getElementById('contactContent');
    if (!contactContent) return;

    const t = translations[currentLang];

    try {
        const data = await apiRequest('/site-settings');
        const settings = data.settings || {};

        contactContent.innerHTML = `
            <div style="line-height: 2; color: var(--text-secondary);">
                <p><strong>${t.authorLabel}</strong>${settings.author_name || '-'}</p>
                <p><strong>${t.contactLabel}</strong>${settings.contact || '-'}</p>
            </div>
        `;

        // Update contact title
        if (contactTitle) {
            contactTitle.textContent = t.contact;
        }
    } catch (error) {
        console.error('Failed to load contact content:', error);
        contactContent.innerHTML = `
            <p>${t.loadFailed}</p>
        `;
    }
}

// ===== Photo Functions =====
async function loadPhotos(append = false) {
    if (!photoGrid) return;

    if (!append) {
        photoGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }

    try {
        // Load maximum 30 photos for waterfall layout (10 rows of 3 photos each)
        const data = await apiRequest(`/photos?page=${currentPage}&limit=30`);

        if (append) {
            photos = [...photos, ...(data.photos || [])];
        } else {
            photos = data.photos || [];
        }

        // Reset to default view when loading all photos
        currentCollectionId = null;

        renderPhotos();

        if (data.pagination && data.pagination.page >= data.pagination.totalPages) {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        } else {
            if (loadMoreBtn) loadMoreBtn.style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Failed to load photos:', error);
        const t = translations[currentLang];
        if (!append && photoGrid) {
            photoGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-title">${t.loadFailed}</div>
                    <div class="empty-state-text">${t.retryLater}</div>
                </div>
            `;
        }
    }
}

// Update sidebar collection active state
function updateSidebarCollectionActiveState(collectionId) {
    document.querySelectorAll('.sidebar-collection-link').forEach(link => {
        link.classList.remove('active');
    });

    if (collectionId) {
        const activeLink = document.querySelector(`.sidebar-collection-link[data-id="${collectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

function renderPhotos() {
    if (!photoGrid) return;

    const t = translations[currentLang];

    // Remove collection-selected class when viewing all photos
    photoGrid.classList.remove('collection-selected');

    if (photos.length === 0) {
        photoGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-title">${t.noPhotos}</div>
                <div class="empty-state-text">${t.uploadFirstPhoto}</div>
            </div>
        `;
        return;
    }

    photoGrid.innerHTML = photos.map(photo => {
        // Calculate aspect ratio from EXIF data for waterfall layout
        const aspectRatio = photo.exif_width && photo.exif_height
            ? photo.exif_height / photo.exif_width
            : 1;
        const height = Math.round(350 * aspectRatio);

        return `
        <div class="photo-card" data-id="${photo.id}" onclick="openPhotoModal(${photo.id})" style="height: auto; aspect-ratio: auto; width: fit-content;">
            <img
                src="/thumbnails/${photo.filename}"
                alt="${photo.title}"
                loading="lazy"
                style="width: ${photo.exif_width || 350}px; height: ${photo.exif_height || height}px; object-fit: contain;"
                onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'>${t.loadFailed}</div>'"
            >
            <div class="photo-overlay">
                <div class="photo-title">${photo.title}</div>
                ${photo.description ? `<div class="photo-description">${photo.description}</div>` : ''}
            </div>
        </div>
        `;
    }).join('');
}

function renderPhotosWithLayout() {
    if (!photoGrid) return;

    const t = translations[currentLang];

    if (photos.length === 0) {
        photoGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-title">${t.noPhotos}</div>
                <div class="empty-state-text">${t.uploadFirstPhoto}</div>
            </div>
        `;
        return;
    }

    // Check if photos have layout information
    const hasLayout = photos.some(p => p.layout_x !== null && p.layout_y !== null);

    if (hasLayout) {
        // Render with custom layout - canvas will be left-aligned
        photoGrid.style.position = 'relative';
        photoGrid.style.height = 'auto';
        photoGrid.style.minHeight = '800px';
        photoGrid.style.width = '100%';

        photoGrid.innerHTML = photos.map(photo => {
            const hasPhotoLayout = photo.layout_x !== null && photo.layout_y !== null &&
                                  photo.layout_width !== null && photo.layout_height !== null;

            if (hasPhotoLayout) {
                return `
                    <div class="photo-card photo-card-absolute"
                         data-id="${photo.id}"
                         onclick="openPhotoModal(${photo.id})"
                         style="position: absolute;
                                left: ${photo.layout_x}px;
                                top: ${photo.layout_y}px;
                                width: ${photo.exif_width || photo.layout_width}px;
                                height: ${photo.exif_height || photo.layout_height}px;">
                        <img
                            src="/thumbnails/${photo.filename}"
                            alt="${photo.title}"
                            loading="lazy"
                            style="width: ${photo.exif_width || photo.layout_width}px; height: ${photo.exif_height || photo.layout_height}px; object-fit: contain;"
                            onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'>${t.loadFailed}</div>'"
                        >
                        <div class="photo-overlay">
                            <div class="photo-title">${photo.title}</div>
                            ${photo.description ? `<div class="photo-description">${photo.description}</div>` : ''}
                        </div>
                    </div>
                `;
            } else {
                // Fallback for photos without layout
                return `
                    <div class="photo-card" data-id="${photo.id}" onclick="openPhotoModal(${photo.id})" style="width: fit-content;">
                        <img
                            src="/thumbnails/${photo.filename}"
                            alt="${photo.title}"
                            loading="lazy"
                            style="width: ${photo.exif_width || 350}px; height: ${photo.exif_height || 350}px; object-fit: contain;"
                            onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'>${t.loadFailed}</div>'"
                        >
                        <div class="photo-overlay">
                            <div class="photo-title">${photo.title}</div>
                            ${photo.description ? `<div class="photo-description">${photo.description}</div>` : ''}
                        </div>
                    </div>
                `;
            }
        }).join('');
    } else {
        // Fallback to grid layout
        photoGrid.style.position = '';
        photoGrid.style.height = '';
        photoGrid.style.minHeight = '';
        photoGrid.style.width = '';
        renderPhotos();
    }

    // Apply canvas scaling for responsive design
    scaleCanvasToFit();
}

// ===== Canvas Scaling =====
function scaleCanvasToFit() {
    if (!photoGrid || currentCollectionId === null) return;

    // Only scale when viewing a collection with layout
    const hasLayout = photos.some(p => p.layout_x !== null && p.layout_y !== null);
    if (!hasLayout) {
        photoGrid.classList.remove('scaled');
        photoGrid.style.transform = '';
        photoGrid.style.width = '100%';
        photoGrid.style.height = 'auto';
        return;
    }

    const wrapper = photoGrid.parentElement;
    if (!wrapper) return;

    // Get container dimensions
    const containerWidth = wrapper.offsetWidth;

    // Calculate canvas dimensions based on photo positions and actual photo sizes
    let maxRight = 0, maxBottom = 0;
    photos.forEach(p => {
        const x = p.layout_x || 0;
        const y = p.layout_y || 0;
        const width = p.exif_width || p.layout_width || 350;
        const height = p.exif_height || p.layout_height || 350;
        maxRight = Math.max(maxRight, x + width);
        maxBottom = Math.max(maxBottom, y + height);
    });

    // Set canvas width to content width
    const contentWidth = Math.max(maxRight + 40, containerWidth); // +40 for padding
    const contentHeight = Math.max(maxBottom + 40, 600); // +40 for padding, min 600px

    photoGrid.style.width = contentWidth + 'px';
    photoGrid.style.height = contentHeight + 'px';

    // Calculate scale factor only if content is wider than container
    let scale = Math.min(1, containerWidth / contentWidth);

    // Limit scale to reasonable values
    scale = Math.min(Math.max(scale, 0.5), 1.5);

    // Apply scale if needed
    if (scale < 1) {
        photoGrid.classList.add('scaled');
        photoGrid.style.transform = `scale(${scale})`;
        photoGrid.style.transformOrigin = 'top left';
    } else {
        photoGrid.classList.remove('scaled');
        photoGrid.style.transform = '';
    }
}

async function openPhotoModal(id) {
    try {
        const photo = await apiRequest(`/photos/${id}`);

        // Debug: Log photo data to check EXIF fields
        console.log('Photo data:', photo);
        console.log('EXIF fields:', {
            camera_make: photo.camera_make,
            camera_model: photo.camera_model,
            lens_model: photo.lens_model,
            iso: photo.iso,
            aperture: photo.aperture,
            shutter_speed: photo.shutter_speed,
            focal_length: photo.focal_length,
            datetime_taken: photo.datetime_taken
        });

        const modalPhoto = document.getElementById('modalPhoto');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const deletePhotoBtn = document.getElementById('deletePhotoBtn');

        if (!modalPhoto || !modalTitle || !modalDescription || !photoModal) {
            showToast('Modal error', 'error');
            return;
        }

        currentModalPhotoId = id;
        modalPhoto.src = `/${photo.r2_key}`;
        modalPhoto.alt = photo.title;
        modalTitle.textContent = photo.title;
        modalDescription.textContent = photo.description || '';

        // Update EXIF information
        updateExifInfo(photo);

        // Show delete button only if user is logged in
        if (deletePhotoBtn) {
            if (currentToken) {
                deletePhotoBtn.textContent = translations[currentLang].deletePhoto;
                deletePhotoBtn.classList.remove('hidden');
            } else {
                deletePhotoBtn.classList.add('hidden');
            }
        }

        photoModal.classList.add('active');
    } catch (error) {
        console.error('Failed to load photo:', error);
        const t = translations[currentLang];
        showToast(t.loadFailed, 'error');
    }
}

async function handleDeletePhoto() {
    if (!currentModalPhotoId) return;

    const t = translations[currentLang];
    if (!confirm(t.deleteConfirm)) {
        return;
    }

    try {
        await apiRequest(`/admin/photos/${currentModalPhotoId}`, {
            method: 'DELETE',
        });

        showToast(t.deleteSuccess);

        // Close modal
        if (photoModal) {
            photoModal.classList.remove('active');
        }

        // Reset current modal photo ID
        currentModalPhotoId = null;

        // Reload photos
        currentPage = 1;
        await loadPhotos();
    } catch (error) {
        console.error('Delete photo error:', error);
        const errorMsg = error.message || '';
        showToast(t.deleteFailed + (errorMsg ? ': ' + errorMsg : ''), 'error');
    }
}

// ===== Collection Functions =====
async function loadCollections() {
    if (!sidebarCollections) return;

    try {
        const data = await apiRequest('/collections');

        if (!data.collections || data.collections.length === 0) {
            const t = translations[currentLang];
            sidebarCollections.innerHTML = `
                <div style="padding: 0.5rem 2rem; font-size: 0.75rem; color: var(--text-light);">
                    ${t.noCollections}
                </div>
            `;
            return;
        }

        sidebarCollections.innerHTML = data.collections.map(collection => `
            <div class="sidebar-collection-link"
                 data-id="${collection.id}"
                 onclick="viewCollection(${collection.id})">
                ${collection.name}
                <span style="color: var(--text-light); margin-left: 0.5rem;">${collection.photo_count || 0}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load collections:', error);
        const t = translations[currentLang];
        sidebarCollections.innerHTML = `
            <div style="padding: 0.5rem 2rem; font-size: 0.75rem; color: var(--text-light);">
                ${t.loadFailed}
            </div>
        `;
    }
}

window.viewCollection = async (id) => {
    try {
        const data = await apiRequest(`/collections/${id}/photos`);

        if (!data.photos || data.photos.length === 0) {
            const t = translations[currentLang];
            showToast(currentLang === 'zh' ? '这个相册还没有照片' : 'This album has no photos yet', 'error');
            return;
        }

        photos = data.photos;
        currentCollectionId = id;

        // Switch to gallery tab if currently in contact or about
        if (currentTab === 'contact' || currentTab === 'about') {
            handleTabSwitch('gallery');
        }

        // Add collection-selected class to photoGrid
        if (photoGrid) {
            photoGrid.classList.add('collection-selected');
        }

        // Update sidebar active state
        updateSidebarCollectionActiveState(id);

        renderPhotosWithLayout();

        // Load and display collection description
        const collectionData = await apiRequest(`/collections/${id}`);
        if (collectionData.collection && collectionData.collection.description) {
            const collectionDescription = document.getElementById('collectionDescription');
            if (collectionDescription) {
                collectionDescription.textContent = collectionData.collection.description;
            }
        }

        // Scroll to gallery
        const galleryElement = document.getElementById('gallerySection');
        if (galleryElement) {
            galleryElement.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Failed to load collection:', error);
        const t = translations[currentLang];
        showToast(t.loadFailed, 'error');
    }
};

// ===== EXIF Functions =====
function updateExifInfo(photo) {
    console.log('updateExifInfo called with:', photo);

    const exifCamera = document.getElementById('exifCamera');
    const exifLens = document.getElementById('exifLens');
    const exifISO = document.getElementById('exifISO');
    const exifAperture = document.getElementById('exifAperture');
    const exifShutter = document.getElementById('exifShutter');
    const exifFocal = document.getElementById('exifFocal');
    const exifDate = document.getElementById('exifDate');

    if (exifCamera) {
        if (photo.camera_make || photo.camera_model) {
            exifCamera.textContent = `${photo.camera_make || ''} ${photo.camera_model || ''}`.trim();
            console.log('Camera set to:', exifCamera.textContent);
        } else {
            exifCamera.textContent = '-';
        }
    }

    if (exifLens) {
        exifLens.textContent = photo.lens_model || '-';
    }

    if (exifISO) {
        exifISO.textContent = photo.iso ? `${photo.iso}` : '-';
    }

    if (exifAperture) {
        exifAperture.textContent = photo.aperture ? `f/${photo.aperture.replace(/^f\//, '').replace(/^f/, '')}` : '-';
    }

    if (exifShutter) {
        exifShutter.textContent = photo.shutter_speed || '-';
    }

    if (exifFocal) {
        exifFocal.textContent = photo.focal_length ? `${photo.focal_length.replace(/mm$/, '')}mm` : '-';
    }

    if (exifDate) {
        exifDate.textContent = photo.datetime_taken || '-';
    }

    // Display GPS coordinates if available
    const exifGPS = document.getElementById('exifGPS');
    const exifGPSItem = document.getElementById('exifGPSItem');
    if (exifGPS && exifGPSItem) {
        if (photo.gps_latitude !== null && photo.gps_longitude !== null) {
            exifGPS.textContent = `${photo.gps_latitude.toFixed(6)}, ${photo.gps_longitude.toFixed(6)}`;
            exifGPSItem.style.display = 'flex';
        } else {
            exifGPSItem.style.display = 'none';
        }
    }

    // Show/hide EXIF section based on whether there's data
    const exifSection = document.getElementById('modalExif');
    const hasExifData = photo.camera_make || photo.camera_model || photo.lens_model ||
                       photo.iso || photo.aperture || photo.shutter_speed ||
                       photo.focal_length || photo.datetime_taken ||
                       (photo.gps_latitude !== null && photo.gps_longitude !== null);

    console.log('EXIF section display:', hasExifData ? 'block' : 'none');

    if (exifSection) {
        exifSection.style.display = hasExifData ? 'block' : 'none';
    }
}

// ===== Collection Header (Welcome Message) =====
function updateCollectionHeader() {
    const collectionDescription = document.getElementById('collectionDescription');
    if (!collectionDescription) return;

    // Check URL for collection parameter
    const urlParams = new URLSearchParams(window.location.search);
    const collectionId = urlParams.get('collection');

    if (collectionId) {
        // Load collection and show its description
        apiRequest(`/collections/${collectionId}`).then(data => {
            const collection = data.collection;
            collectionDescription.textContent = collection.description || '';
        }).catch(error => {
            console.error('Failed to load collection:', error);
            collectionDescription.textContent = '';
        });
    } else {
        // Show welcome message from site settings
        collectionDescription.textContent = siteSettings.welcome_message || 'HELLO!';
    }
}

// ===== Expose functions globally =====
