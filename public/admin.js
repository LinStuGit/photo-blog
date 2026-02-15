// ===== Admin Page State =====
let currentCollectionId = null;
let uploadedImageData = null;
let uploadedThumbnailData = null;
let libraryPhotos = [];
let detailPhotoId = null;
let currentLang = localStorage.getItem('currentLang') || 'en';
let canvasScale = 1;
let minScale = 0.25;
let maxScale = 3;

// ===== Language Translations =====
const translations = {
    zh: {
        adminTitle: '管理后台',
        preview: '预览效果',
        saveLayout: '保存布局',
        editSiteSettings: '修改网页信息',
        changePassword: '修改密码',
        logout: '退出登录',
        collectionSelect: '相册选择',
        newCollection: '+ 新建相册',
        photoLibrary: '照片库',
        upload: '+ 上传',
        searchPlaceholder: '搜索照片名称...',
        tips: '操作提示',
        tips1: '• 点击照片查看详情',
        tips2: '• 编辑照片标题和相册',
        tips3: '• 点击保存布局保存设置',
        selectCollection: '选择相册以查看和编辑照片',
        selectCollectionHint: '从左侧选择相册后，照片将显示在此处',
        uploadPhoto: '上传照片',
        clickOrDrag: '点击选择文件或拖拽到此处',
        title: '标题',
        titlePlaceholder: '请输入照片标题',
        description: '描述',
        descriptionPlaceholder: '照片描述（可选）',
        collection: '所属相册',
        selectFirst: '请先选择相册',
        cancel: '取消',
        confirmUpload: '确认上传',
        changePasswordTitle: '修改密码',
        currentPassword: '当前密码',
        newPassword: '新密码',
        newPasswordPlaceholder: '至少8位',
        confirmPassword: '确认新密码',
        confirmChange: '确认修改',
        photoDetail: '照片详情',
        saveChanges: '保存修改',
        siteSettings: '修改网页信息',
        siteTitle: '网站标题',
        siteTitlePlaceholder: 'PhotoBlog',
        siteLogo: 'LOGO',
        siteLogoPlaceholder: 'LINTHU',
        authorName: '作者姓名',
        authorNamePlaceholder: 'Lin',
        contact: '联系方式',
        contactPlaceholder: 'DPICW_WY@163.com',
        aboutText: '关于',
        aboutTextPlaceholder: '这是一个"相册展示系统',
        welcomeMessage: '欢迎语',
        welcomeMessagePlaceholder: 'HELLO!',
        save: '保存',
        deleteCollection: '删除相册',
        deletePhoto: '删除照片',
        confirmDelete: '确认删除',
        layoutSaved: '布局已保存',
        layoutReset: '布局已重置',
        photoUploaded: '照片上传成功',
        photoUpdated: '照片已更新',
        collectionCreated: '相册已创建',
        collectionDeleted: '相册已删除',
        photoDeleted: '照片已删除',
        settingsSaved: '网站信息已更新',
        passwordChanged: '密码已修改',
        photoDeletedConfirm: '确认删除这张照片？',
        collectionDeletedConfirm: '确定要删除这个相册吗？',
        collectionNotEmpty: '无法删除包含照片的相册',
        collectionNotEmptyMessage: '请先删除相册中的所有照片，然后再删除相册',
        noCollections: '暂无相册',
        noPhotos: '暂无照片',
        returnToAdmin: '← 返回管理继续编辑',
        icpNumber: 'ICP备案号',
        showICP: '显示ICP备案号',
        copyright: '© 2024 ',
        collectionSettings: '相册设置',
        collectionName: '相册名称',
        collectionDescription: '相册描述',
        editCollection: '编辑相册',
        saveCollection: '保存相册',
        collectionNamePlaceholder: '输入相册名称',
        collectionDescriptionPlaceholder: '输入相册描述（可选）',
        collectionUpdated: '相册已更新',
        collectionInfo: '相册信息',
        photoCount: '照片数量',
        createCollection: '新建相册',
        newCollectionName: '相册名称',
        newCollectionDescription: '相册描述',
        createCollectionPlaceholder: '输入相册名称',
        newCollectionDescriptionPlaceholder: '输入相册描述（可选）',
        createCollectionBtn: '创建相册',
        exifInfo: 'EXIF信息',
        deleteCollectionBtn: '删除相册',
        deletePhotoBtn: '删除照片',
        zoomOut: '缩小',
        zoomIn: '放大',
        zoomFit: '适应屏幕'
    },
    en: {
        adminTitle: 'Admin Panel',
        preview: 'Preview',
        saveLayout: 'Save Layout',
        editSiteSettings: 'Edit Site Info',
        changePassword: 'Change Password',
        logout: 'Logout',
        collectionSelect: 'Select Album',
        newCollection: '+ New Album',
        photoLibrary: 'Photo Library',
        upload: '+ Upload',
        searchPlaceholder: 'Search photos...',
        tips: 'Tips',
        tips1: '• Click photo to view details',
        tips2: '• Edit photo title and album',
        tips3: '• Click save layout to save changes',
        selectCollection: 'Select an album to view and edit photos',
        selectCollectionHint: 'Photos will appear here after selecting an album',
        uploadPhoto: 'Upload Photo',
        clickOrDrag: 'Click to select or drag files here',
        title: 'Title',
        titlePlaceholder: 'Enter photo title',
        description: 'Description',
        descriptionPlaceholder: 'Photo description (optional)',
        collection: 'Album',
        selectFirst: 'Please select an album first',
        cancel: 'Cancel',
        confirmUpload: 'Upload',
        changePasswordTitle: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        newPasswordPlaceholder: 'At least 8 characters',
        confirmPassword: 'Confirm Password',
        confirmChange: 'Confirm',
        photoDetail: 'Photo Details',
        saveChanges: 'Save Changes',
        siteSettings: 'Edit Site Info',
        siteTitle: 'Site Title',
        siteTitlePlaceholder: 'PhotoBlog',
        siteLogo: 'LOGO',
        siteLogoPlaceholder: 'LINTHU',
        authorName: 'Author Name',
        authorNamePlaceholder: 'Lin',
        contact: 'Contact',
        contactPlaceholder: 'DPICW_WY@163.com',
        aboutText: 'About',
        aboutTextPlaceholder: 'This is a photo gallery system',
        welcomeMessage: 'Welcome Message',
        welcomeMessagePlaceholder: 'HELLO!',
        save: 'Save',
        deleteCollection: 'Delete Album',
        deletePhoto: 'Delete Photo',
        confirmDelete: 'Confirm Delete',
        layoutSaved: 'Layout saved',
        layoutReset: 'Layout reset',
        photoUploaded: 'Photo uploaded successfully',
        photoUpdated: 'Photo updated',
        collectionCreated: 'Album created',
        collectionDeleted: 'Album deleted',
        photoDeleted: 'Photo deleted',
        settingsSaved: 'Site info updated',
        passwordChanged: 'Password changed',
        photoDeletedConfirm: 'Delete this photo?',
        collectionDeletedConfirm: 'Are you sure you want to delete this album?',
        collectionNotEmpty: 'Cannot delete album with photos',
        collectionNotEmptyMessage: 'Please remove all photos from the album before deleting',
        noCollections: 'No Albums',
        noPhotos: 'No Photos',
        returnToAdmin: '← Return to Admin',
        icpNumber: 'ICP Number',
        showICP: 'Show ICP Number',
        copyright: '© 2024 ',
        collectionSettings: 'Album Settings',
        collectionName: 'Album Name',
        collectionDescription: 'Album Description',
        editCollection: 'Edit Album',
        saveCollection: 'Save Album',
        collectionNamePlaceholder: 'Enter album name',
        collectionDescriptionPlaceholder: 'Enter album description (optional)',
        collectionUpdated: 'Album updated',
        collectionInfo: 'Album Info',
        photoCount: 'Photo Count',
        createCollection: 'New Album',
        newCollectionName: 'Album Name',
        newCollectionDescription: 'Album Description',
        createCollectionPlaceholder: 'Enter album name',
        newCollectionDescriptionPlaceholder: 'Enter album description (optional)',
        createCollectionBtn: 'Create Album',
        exifInfo: 'EXIF Info',
        deleteCollectionBtn: 'Delete Album',
        deletePhotoBtn: 'Delete Photo',
        zoomOut: 'Zoom Out',
        zoomIn: 'Zoom In',
        zoomFit: 'Fit to Screen'
    }
};

// ===== DOM Elements =====
const canvas = document.getElementById('canvas');
const collectionList = document.getElementById('collectionList');
const photoLibrary = document.getElementById('photoLibrary');
const photoLibrarySection = document.getElementById('photoLibrarySection');
const photoSearchInput = document.getElementById('photoSearchInput');
const uploadModal = document.getElementById('uploadModal');
const uploadPreviewImage = document.getElementById('uploadPreviewImage');
const photoSettingsForm = document.getElementById('photoSettingsForm');
const uploadProgress = document.getElementById('uploadProgress');
const fileInput = document.getElementById('fileInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const confirmUploadBtn = document.getElementById('confirmUploadBtn');
const photoDetailModal = document.getElementById('photoDetailModal');
const photoDetailForm = document.getElementById('photoDetailForm');
const langToggle = document.getElementById('langToggle');

// ===== Language Functions =====
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('currentLang', currentLang);
    updateLanguageUI();
    // Re-render collections and photos to update their text
    if (currentCollectionId) {
        selectCollection(currentCollectionId);
    } else {
        loadCollections();
    }
}

function updateLanguageUI() {
    const t = translations[currentLang];

    // Update language toggle button
    if (langToggle) {
        langToggle.textContent = currentLang === 'zh' ? 'EN' : '中文';
    }

    // Update header
    document.querySelector('.admin-logo span').textContent = t.adminTitle;
    document.getElementById('previewBtn').textContent = t.preview;
    document.getElementById('saveLayoutBtn').textContent = t.saveLayout;
    document.getElementById('editSiteSettingsBtn').textContent = t.editSiteSettings;
    document.getElementById('changePasswordBtn').textContent = t.changePassword;
    document.getElementById('logoutBtn').textContent = t.logout;

    // Update sidebar
    document.querySelector('.admin-sidebar h3:first-of-type').textContent = t.collectionSelect;
    document.getElementById('createCollectionBtn').textContent = t.newCollection;
    document.querySelector('.sidebar-section-header h3').textContent = t.photoLibrary;
    document.getElementById('uploadBtn').textContent = t.upload;
    photoSearchInput.placeholder = t.searchPlaceholder;
    document.querySelectorAll('.admin-sidebar h3')[2].textContent = t.tips;
    document.querySelectorAll('.help-text p')[0].textContent = t.tips1;
    document.querySelectorAll('.help-text p')[1].textContent = t.tips2;
    document.querySelectorAll('.help-text p')[2].textContent = t.tips3;

    // Update canvas placeholder
    const canvasPlaceholder = document.querySelector('.canvas-placeholder');
    if (canvasPlaceholder) {
        canvasPlaceholder.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>${t.selectCollection}</p>
            <p class="hint">${t.selectCollectionHint}</p>
        `;
    }

    // Update modals
    document.querySelector('#uploadModal h2').textContent = t.uploadPhoto;
    document.querySelector('#uploadPlaceholder p').textContent = t.clickOrDrag;
    document.querySelector('label[for="photoTitle"]').textContent = t.title;
    document.getElementById('photoTitle').placeholder = t.titlePlaceholder;
    document.querySelector('label[for="photoDescription"]').textContent = t.description;
    document.getElementById('photoDescription').placeholder = t.descriptionPlaceholder;
    document.querySelector('label[for="photoCollection"]').textContent = t.collection;
    document.getElementById('cancelUploadBtn').textContent = t.cancel;
    document.getElementById('confirmUploadBtn').textContent = t.confirmUpload;

    document.querySelector('#changePasswordModal h2').textContent = t.changePasswordTitle;
    document.querySelector('label[for="currentPassword"]').textContent = t.currentPassword;
    document.querySelector('label[for="newPassword"]').textContent = t.newPassword;
    document.getElementById('newPassword').placeholder = t.newPasswordPlaceholder;
    document.querySelector('label[for="confirmPassword"]').textContent = t.confirmPassword;
    document.getElementById('confirmPassword').placeholder = t.newPasswordPlaceholder;
    document.getElementById('cancelChangePasswordBtn').textContent = t.cancel;
    document.querySelector('#changePasswordForm button[type="submit"]').textContent = t.confirmChange;

    document.querySelector('#photoDetailModal h2').textContent = t.photoDetail;
    document.querySelector('label[for="detailPhotoTitle"]').textContent = t.title;
    document.querySelector('label[for="detailPhotoDescription"]').textContent = t.description;
    document.querySelector('label[for="detailPhotoCollection"]').textContent = t.collection;
    document.getElementById('cancelDetailBtn').textContent = t.cancel;
    document.querySelector('#photoDetailForm button[type="submit"]').textContent = t.saveChanges;

    document.querySelector('#siteSettingsModal h2').textContent = t.siteSettings;
    document.querySelector('label[for="siteTitle"]').textContent = t.siteTitle;
    document.getElementById('siteTitle').placeholder = t.siteTitlePlaceholder;
    document.querySelector('label[for="siteLogo"]').textContent = t.siteLogo;
    document.getElementById('siteLogo').placeholder = t.siteLogoPlaceholder;
    document.querySelector('label[for="authorName"]').textContent = t.authorName;
    document.getElementById('authorName').placeholder = t.authorNamePlaceholder;
    document.querySelector('label[for="contact"]').textContent = t.contact;
    document.getElementById('contact').placeholder = t.contactPlaceholder;
    document.querySelector('label[for="aboutText"]').textContent = t.aboutText;
    document.getElementById('aboutText').placeholder = t.aboutTextPlaceholder;
    document.querySelector('label[for="welcomeMessage"]').textContent = t.welcomeMessage;
    document.getElementById('welcomeMessage').placeholder = t.welcomeMessagePlaceholder;
    document.querySelector('label[for="icpNumber"]').textContent = t.icpNumber;
    document.getElementById('icpNumber').placeholder = '';
    document.querySelector('#showICP').nextElementSibling.textContent = t.showICP;
    document.getElementById('cancelSiteSettingsBtn').textContent = t.cancel;
    document.querySelector('#siteSettingsForm button[type="submit"]').textContent = t.save;

    // Update collection settings modal
    const collectionSettingsModal = document.getElementById('collectionSettingsModal');
    if (collectionSettingsModal) {
        collectionSettingsModal.querySelector('h2').textContent = t.collectionSettings;
        document.querySelector('label[for="collectionSettingsName"]').textContent = t.collectionName;
        document.getElementById('collectionSettingsName').placeholder = t.collectionNamePlaceholder;
        document.querySelector('label[for="collectionSettingsDescription"]').textContent = t.collectionDescription;
        document.getElementById('collectionSettingsDescription').placeholder = t.collectionDescriptionPlaceholder;
        document.getElementById('deleteCollectionBtn').textContent = t.deleteCollectionBtn;
        document.getElementById('cancelCollectionSettingsBtn').textContent = t.cancel;
        document.querySelector('#collectionSettingsForm button[type="submit"]').textContent = t.saveCollection;
    }

    // Update create collection modal
    const createCollectionModal = document.getElementById('createCollectionModal');
    if (createCollectionModal) {
        createCollectionModal.querySelector('h2').textContent = t.createCollection;
        document.querySelector('label[for="newCollectionName"]').textContent = t.newCollectionName;
        document.getElementById('newCollectionName').placeholder = t.createCollectionPlaceholder;
        document.querySelector('label[for="newCollectionDescription"]').textContent = t.newCollectionDescription;
        document.getElementById('newCollectionDescription').placeholder = t.newCollectionDescriptionPlaceholder;
        document.getElementById('cancelCreateCollectionBtn').textContent = t.cancel;
        document.querySelector('#createCollectionForm button[type="submit"]').textContent = t.createCollectionBtn;
    }

    // Update photo detail modal delete button and EXIF
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    if (deletePhotoBtn) {
        deletePhotoBtn.textContent = t.deletePhotoBtn;
    }
    const detailPhotoExif = document.getElementById('detailPhotoExif');
    if (detailPhotoExif) {
        detailPhotoExif.querySelector('h4').textContent = t.exifInfo;
    }

    // Update footer
    const adminCurrentYear = document.getElementById('adminCurrentYear');
    if (adminCurrentYear) {
        adminCurrentYear.textContent = new Date().getFullYear();
    }

    // Update empty states
    updateEmptyStateTranslations();
}

function updateEmptyStateTranslations() {
    const t = translations[currentLang];

    // Update collection list empty state
    const collectionList = document.querySelector('.collection-list');
    if (collectionList && collectionList.children.length === 0) {
        collectionList.innerHTML = `<p class="empty-state">${t.noCollections}</p>`;
    }

    // Update photo library empty state
    const photoLibrary = document.querySelector('.photo-library');
    if (photoLibrary && photoLibrary.children.length === 0) {
        photoLibrary.innerHTML = `<p class="empty-state">${t.noPhotos}</p>`;
    }
}

// ===== API Configuration =====
const API_BASE = '/api';

// ===== Utility Functions =====
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.getElementById('toastContainer').appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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
            let errorMessage = 'Request failed';
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
        let errorMessage = 'Request failed';
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
    checkAuth();
    setupEventListeners();
    updateLanguageUI();
    loadCollections();
    updateAdminFooter();

    // Auto-select first collection after loading
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const collectionParam = urlParams.get('collection');

        if (collectionParam) {
            const collectionId = parseInt(collectionParam, 10);
            if (!isNaN(collectionId)) {
                selectCollection(collectionId);
            }
        } else {
            // Select the first collection by default
            const firstCollection = document.querySelector('.collection-item');
            if (firstCollection) {
                const collectionId = parseInt(firstCollection.dataset.id, 10);
                if (!isNaN(collectionId)) {
                    selectCollection(collectionId);
                }
            }
        }
    }, 500);
});

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showToast(currentLang === 'zh' ? '请先登录' : 'Please login first', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        return;
    }
}

function setupEventListeners() {
    // Language toggle
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Change password button
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        showChangePasswordModal();
    });

    // Edit site settings button
    document.getElementById('editSiteSettingsBtn').addEventListener('click', () => {
        showSiteSettingsModal();
    });

    // Save layout button
    document.getElementById('saveLayoutBtn').addEventListener('click', handleSaveLayout);

    // Preview button
    document.getElementById('previewBtn').addEventListener('click', handlePreview);

    // Create collection button
    document.getElementById('createCollectionBtn').addEventListener('click', handleCreateCollection);

    // Upload button
    document.getElementById('uploadBtn').addEventListener('click', () => {
        showUploadModal();
    });

    // Zoom buttons
    document.getElementById('zoomOutBtn').addEventListener('click', handleZoomOut);
    document.getElementById('zoomInBtn').addEventListener('click', handleZoomIn);
    document.getElementById('zoomFitBtn').addEventListener('click', handleZoomFit);

    // Photo search input
    photoSearchInput.addEventListener('input', debounce(handlePhotoSearch, 300));

    // Setup global drag and drop
    setupGlobalDragDrop();

    // Modal close
    uploadModal.querySelector('.modal-close').addEventListener('click', () => {
        hideUploadModal();
    });

    // Cancel upload button
    document.getElementById('cancelUploadBtn').addEventListener('click', () => {
        hideUploadModal();
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Upload placeholder click
    uploadPlaceholder.addEventListener('click', () => {
        fileInput.click();
    });

    // Upload area drag and drop
    const uploadArea = uploadModal.querySelector('.upload-preview');
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleFileSelect({ target: { files } });
        }
    });

    // Photo settings form
    photoSettingsForm.addEventListener('submit', handlePhotoUpload);

    // Change password form
    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordForm = document.getElementById('changePasswordForm');
    changePasswordForm.addEventListener('submit', handleChangePassword);
    changePasswordModal.querySelector('.modal-close').addEventListener('click', () => {
        hideChangePasswordModal();
    });
    document.getElementById('cancelChangePasswordBtn').addEventListener('click', () => {
        hideChangePasswordModal();
    });

    // Site settings form
    const siteSettingsModal = document.getElementById('siteSettingsModal');
    const siteSettingsForm = document.getElementById('siteSettingsForm');
    siteSettingsForm.addEventListener('submit', handleSiteSettingsSave);
    siteSettingsModal.querySelector('.modal-close').addEventListener('click', () => {
        hideSiteSettingsModal();
    });
    document.getElementById('cancelSiteSettingsBtn').addEventListener('click', () => {
        hideSiteSettingsModal();
    });

    // Collection settings form
    const collectionSettingsModal = document.getElementById('collectionSettingsModal');
    const collectionSettingsForm = document.getElementById('collectionSettingsForm');
    collectionSettingsForm.addEventListener('submit', handleCollectionSettingsSave);
    collectionSettingsModal.querySelector('.modal-close').addEventListener('click', () => {
        hideCollectionSettingsModal();
    });
    document.getElementById('cancelCollectionSettingsBtn').addEventListener('click', () => {
        hideCollectionSettingsModal();
    });
    document.getElementById('deleteCollectionBtn').addEventListener('click', handleDeleteCollection);

    // Create collection form
    const createCollectionModal = document.getElementById('createCollectionModal');
    const createCollectionForm = document.getElementById('createCollectionForm');
    createCollectionForm.addEventListener('submit', handleCreateCollectionSubmit);
    createCollectionModal.querySelector('.modal-close').addEventListener('click', () => {
        hideCreateCollectionModal();
    });
    document.getElementById('cancelCreateCollectionBtn').addEventListener('click', () => {
        hideCreateCollectionModal();
    });

    // Click outside modal to close
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            hideUploadModal();
        }
    });

    changePasswordModal.addEventListener('click', (e) => {
        if (e.target === changePasswordModal) {
            hideChangePasswordModal();
        }
    });

    siteSettingsModal.addEventListener('click', (e) => {
        if (e.target === siteSettingsModal) {
            hideSiteSettingsModal();
        }
    });

    collectionSettingsModal.addEventListener('click', (e) => {
        if (e.target === collectionSettingsModal) {
            hideCollectionSettingsModal();
        }
    });

    createCollectionModal.addEventListener('click', (e) => {
        if (e.target === createCollectionModal) {
            hideCreateCollectionModal();
        }
    });

    // Photo detail modal events
    photoDetailForm.addEventListener('submit', handlePhotoDetailSubmit);
    photoDetailModal.querySelector('.modal-close').addEventListener('click', () => {
        hidePhotoDetailModal();
    });
    document.getElementById('cancelDetailBtn').addEventListener('click', () => {
        hidePhotoDetailModal();
    });
    document.getElementById('deletePhotoBtn').addEventListener('click', handleDeletePhoto);
    photoDetailModal.addEventListener('click', (e) => {
        if (e.target === photoDetailModal) {
            hidePhotoDetailModal();
        }
    });
}

// ===== Collections =====
async function loadCollections() {
    try {
        const data = await apiRequest('/collections');
        renderCollections(data.collections || []);
    } catch (error) {
        console.error('Failed to load collections:', error);
        showToast(currentLang === 'zh' ? '加载相册失败' : 'Failed to load collections', 'error');
    }
}

function renderCollections(collections) {
    const t = translations[currentLang];
    collectionList.innerHTML = collections.map(collection => `
        <div class="collection-item ${currentCollectionId === collection.id ? 'active' : ''}"
             data-id="${collection.id}"
             ondblclick="showCollectionSettingsModal(${collection.id})"
             onclick="selectCollection(${collection.id})">
            <div class="collection-item-name">${collection.name}</div>
            <div class="collection-item-count">${collection.photo_count || 0} ${currentLang === 'zh' ? '张照片' : 'photos'}</div>
        </div>
    `).join('');

    if (collections.length === 0) {
        collectionList.innerHTML = `<div style="text-align: center; color: var(--text-light); font-size: 0.8rem;">${t.noCollections}</div>`;
    }
}

window.selectCollection = async (id) => {
    currentCollectionId = id;

    // Update active state
    document.querySelectorAll('.collection-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.dataset.id) === id);
    });

    // Show photo library section
    photoLibrarySection.style.display = 'block';
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.style.display = 'inline-block';
    }

    // Load collection photos
    try {
        const data = await apiRequest(`/collections/${id}/photos`);
        libraryPhotos = data.photos || [];
        renderPhotoLibrary(libraryPhotos);
        renderPhotosOnCanvas(libraryPhotos);
        showToast(currentLang === 'zh' ? '已加载相册照片' : 'Album photos loaded');
    } catch (error) {
        console.error('Failed to load collection photos:', error);
        showToast(currentLang === 'zh' ? '加载照片失败' : 'Failed to load photos', 'error');
    }
};

async function handleCreateCollection() {
    showCreateCollectionModal();
}

// ===== Photo Library =====
async function loadPhotoLibrary(photos = null) {
    if (photos) {
        libraryPhotos = photos;
        renderPhotoLibrary(photos);
    } else {
        // Only load if a collection is selected
        if (!currentCollectionId) return;
        try {
            const data = await apiRequest('/photos?limit=100');
            libraryPhotos = data.photos || [];
            renderPhotoLibrary(libraryPhotos);
        } catch (error) {
            console.error('Failed to load photos:', error);
            showToast(currentLang === 'zh' ? '加载照片库失败' : 'Failed to load photo library', 'error');
        }
    }
}

function showCreateCollectionModal() {
    const modal = document.getElementById('createCollectionModal');
    modal.classList.add('active');
}

function hideCreateCollectionModal() {
    const modal = document.getElementById('createCollectionModal');
    modal.classList.remove('active');
    document.getElementById('createCollectionForm').reset();
}

async function handleCreateCollectionSubmit(e) {
    e.preventDefault();
    const t = translations[currentLang];

    const nameInput = document.getElementById('newCollectionName');
    const descriptionInput = document.getElementById('newCollectionDescription');

    if (!nameInput.value.trim()) {
        showToast(currentLang === 'zh' ? '相册名称不能为空' : 'Album name cannot be empty', 'error');
        return;
    }

    try {
        await apiRequest('/admin/collections', {
            method: 'POST',
            body: JSON.stringify({
                name: nameInput.value.trim(),
                description: descriptionInput.value.trim()
            }),
        });

        showToast(t.collectionCreated);
        hideCreateCollectionModal();
        loadCollections();
    } catch (error) {
        showToast((currentLang === 'zh' ? '创建失败: ' : 'Create failed: ') + error.message, 'error');
    }
}

function handlePhotoSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        renderPhotoLibrary(libraryPhotos);
        return;
    }

    const filtered = libraryPhotos.filter(photo =>
        photo.title.toLowerCase().includes(query)
    );

    renderPhotoLibrary(filtered);
}

function renderPhotoLibrary(photos) {
    const t = translations[currentLang];
    photoLibrary.innerHTML = photos.map(photo => `
        <div class="library-photo"
             data-id="${photo.id}"
             data-title="${photo.title}"
             data-key="${photo.r2_key}"
             data-exif-width="${photo.exif_width || ''}"
             data-exif-height="${photo.exif_height || ''}"
             draggable="true"
             onclick="openPhotoDetail(${photo.id})">
            <img src="/thumbnails/${photo.filename}" alt="${photo.title}" loading="lazy">
            <div class="library-photo-title">${photo.title}</div>
        </div>
    `).join('');

    if (photos.length === 0) {
        photoLibrary.innerHTML = `<div style="grid-column: span 2; text-align: center; color: var(--text-light); font-size: 0.8rem; padding: 2rem;">${t.noPhotos}</div>`;
    }

    // Add drag events to library photos
    document.querySelectorAll('.library-photo').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            if (!currentCollectionId) {
                e.preventDefault();
                showToast(currentLang === 'zh' ? '请先选择相册' : 'Please select an album first', 'error');
                return;
            }
            e.dataTransfer.setData('text/plain', item.dataset.id);
            e.dataTransfer.setData('photo-title', item.dataset.title);
            e.dataTransfer.setData('photo-key', item.dataset.key);
            e.dataTransfer.setData('exif-width', item.dataset.exifWidth);
            e.dataTransfer.setData('exif-height', item.dataset.exifHeight);
        });

        item.addEventListener('dragend', (e) => {
            // Create photo on canvas at drop position
            const photoId = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (!isNaN(photoId) && currentCollectionId) {
                const photoKey = e.dataTransfer.getData('photo-key');
                const photoTitle = e.dataTransfer.getData('photo-title');
                const exifWidth = parseInt(e.dataTransfer.getData('exif-width'), 10);
                const exifHeight = parseInt(e.dataTransfer.getData('exif-height'), 10);

                // Add photo to current collection and render on canvas
                addPhotoToCanvas(photoId, photoKey, photoTitle, exifWidth, exifHeight);
            }
        });
    });
}

async function addPhotoToCanvas(photoId, photoKey, photoTitle, exifWidth, exifHeight) {
    try {
        // Update photo's collection_id
        await apiRequest(`/admin/photos/${photoId}`, {
            method: 'PUT',
            body: JSON.stringify({
                collection_id: currentCollectionId,
                layout_x: lastDropPosition.x,
                layout_y: lastDropPosition.y,
                layout_width: exifWidth ? 250 : 250,
                layout_height: exifWidth && exifHeight ? Math.round(250 * exifHeight / exifWidth) : 250
            }),
        });

        // Add photo to libraryPhotos and render only the new photo on canvas
        const newPhoto = {
            id: photoId,
            r2_key: photoKey,
            title: photoTitle,
            exif_width: exifWidth,
            exif_height: exifHeight,
            layout_x: lastDropPosition.x,
            layout_y: lastDropPosition.y,
            layout_width: exifWidth ? 250 : 250,
            layout_height: exifWidth && exifHeight ? Math.round(250 * exifHeight / exifWidth) : 250
        };

        libraryPhotos.push(newPhoto);

        // Render only the new photo on canvas (without clearing existing ones)
        renderCanvasPhoto(newPhoto, newPhoto.layout_x, newPhoto.layout_y, newPhoto.layout_width, newPhoto.layout_height);

        // Update photo library display
        renderPhotoLibrary(libraryPhotos);
    } catch (error) {
        console.error('Failed to add photo to canvas:', error);
        showToast(currentLang === 'zh' ? '添加照片失败' : 'Failed to add photo', 'error');
    }
}

// ===== Canvas Photo Display =====
function renderPhotosOnCanvas(photos) {
    // Clear existing photos
    document.querySelectorAll('.canvas-photo').forEach(el => el.remove());

    // Show/hide placeholder
    const placeholder = canvas.querySelector('.canvas-placeholder');
    if (placeholder) {
        placeholder.style.display = photos.length > 0 ? 'none' : 'block';
    }

    // Render photos in grid layout
    photos.forEach((photo, index) => {
        // Use saved layout if available, otherwise use default grid
        const hasLayout = photo.layout_x !== null && photo.layout_y !== null &&
                         photo.layout_width !== null && photo.layout_height !== null;

        let x, y, width, height;

        if (hasLayout) {
            x = photo.layout_x;
            y = photo.layout_y;
            width = photo.layout_width;
            height = photo.layout_height;
        } else {
            const col = index % 3;
            const row = Math.floor(index / 3);
            x = 20 + col * 280;
            y = 20 + row * 280;
            // Use a default size that maintains aspect ratio
            width = 250;
            height = photo.exif_height ? Math.round(250 * photo.exif_height / photo.exif_width) : 250;
        }

        renderCanvasPhoto(photo, x, y, width, height);
    });
}

function renderCanvasPhoto(photo, x, y, width, height) {
    const el = document.createElement('div');
    el.className = 'canvas-photo';
    el.dataset.id = photo.id;
    el.dataset.originalX = x;
    el.dataset.originalY = y;
    el.dataset.originalWidth = width;
    el.dataset.originalHeight = height;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = width + 'px';
    el.style.height = height + 'px';
    el.style.overflow = 'hidden';

    el.innerHTML = `
        <img src="/thumbnails/${photo.filename}" alt="${photo.title}" style="width: ${photo.exif_width}px; height: ${photo.exif_height}px; object-fit: contain; max-width: 100%; max-height: 100%;">
    `;

    // Click to select the photo for dragging and resizing
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isDragging && !isResizing) {
            selectPhotoOnCanvas(el);
        }
    });

    // Mouse down for dragging
    el.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-handle')) return;

        e.stopPropagation();
        if (!el.classList.contains('selected')) {
            selectPhotoOnCanvas(el);
        }

        isDragging = true;
        const canvasRect = canvas.getBoundingClientRect();
        dragOffset.x = e.clientX - canvasRect.left - parseInt(el.style.left);
        dragOffset.y = e.clientY - canvasRect.top - parseInt(el.style.top);
    });

    canvas.appendChild(el);
}

// Select photo on canvas
function selectPhotoOnCanvas(el) {
    // Remove selection from all photos
    document.querySelectorAll('.canvas-photo').forEach(photo => {
        photo.classList.remove('selected');
    });

    // Add selection to clicked photo
    el.classList.add('selected');
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Generate thumbnail client-side using Canvas
async function generateClientThumbnail(imageDataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                const QUALITY = 0.7;

                let width = img.width;
                let height = img.height;

                // Calculate new dimensions maintaining aspect ratio
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Create canvas and resize
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        console.log(`Generated thumbnail: ${width}x${height}, ${blob.size} bytes`);
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create thumbnail blob'));
                    }
                }, 'image/jpeg', QUALITY);
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
        img.src = imageDataUrl;
    });
}

async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast(currentLang === 'zh' ? '请选择图片文件' : 'Please select an image file', 'error');
        return;
    }

    try {
        const imageDataUrl = await readFileAsDataURL(file);
        showUploadModal(imageDataUrl, file.name);
    } catch (error) {
        console.error('Failed to read file:', error);
        showToast(currentLang === 'zh' ? '读取文件失败' : 'Failed to read file', 'error');
    }
}

function showUploadModal(imageDataUrl = null, filename = null) {
    if (imageDataUrl) {
        uploadPreviewImage.src = imageDataUrl;
        uploadPreviewImage.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
        uploadedImageData = {
            imageDataUrl,
            filename,
            timestamp: Date.now()
        };

        // Generate thumbnail client-side
        generateClientThumbnail(imageDataUrl).then(thumbnailBlob => {
            uploadedThumbnailData = thumbnailBlob;
        }).catch(err => {
            console.error('Failed to generate thumbnail:', err);
            uploadedThumbnailData = null;
        });

        // Set default title from filename
        const title = filename.replace(/\.[^/.]+$/, '');
        document.getElementById('photoTitle').value = title;
        confirmUploadBtn.disabled = false;
    } else {
        uploadPreviewImage.style.display = 'none';
        uploadPreviewImage.src = '';
        uploadPlaceholder.style.display = 'block';
        uploadedImageData = null;
        uploadedThumbnailData = null;
        document.getElementById('photoTitle').value = '';
        document.getElementById('photoDescription').value = '';
        confirmUploadBtn.disabled = true;
    }

    // Load collections
    loadCollectionsForUpload();

    uploadModal.classList.add('active');
}

function hideUploadModal() {
    uploadModal.classList.remove('active');
    uploadedImageData = null;
    uploadedThumbnailData = null;
    photoSettingsForm.reset();
    uploadProgress.classList.add('hidden');
}

async function loadCollectionsForUpload() {
    try {
        const data = await apiRequest('/collections');
        const select = document.getElementById('photoCollection');
        const t = translations[currentLang];

        // Load all collections, with current collection selected by default
        if (data.collections && data.collections.length > 0) {
            select.innerHTML = data.collections.map(c => 
                `<option value="${c.id}" ${c.id === currentCollectionId ? 'selected' : ''}>${c.name}</option>`
            ).join('');
            select.disabled = false;
        } else {
            select.innerHTML = `<option value="">${t.selectFirst}</option>`;
            select.disabled = true;
        }
    } catch (error) {
        console.error('Failed to load collections:', error);
    }
}

async function handlePhotoUpload(e) {
    e.preventDefault();

    if (!uploadedImageData) {
        showToast(currentLang === 'zh' ? '没有待上传的照片' : 'No photo to upload', 'error');
        return;
    }

    const titleInput = document.getElementById('photoTitle');
    const descriptionInput = document.getElementById('photoDescription');
    const collectionSelect = document.getElementById('photoCollection');

    if (!titleInput || !descriptionInput || !collectionSelect) {
        showToast(currentLang === 'zh' ? '表单错误' : 'Form error', 'error');
        return;
    }

    const title = titleInput.value.trim();
    const description = descriptionInput.value;
    const collectionId = collectionSelect.value;

    if (!title) {
        showToast(currentLang === 'zh' ? '请输入照片标题' : 'Please enter photo title', 'error');
        return;
    }

    // Convert data URL to Blob
    const response = await fetch(uploadedImageData.imageDataUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('file', blob, uploadedImageData.filename);
    formData.append('title', title);
    formData.append('description', description);
    if (collectionId) {
        formData.append('collection_id', collectionId);
    }

    // Add client-generated thumbnail if available
    if (uploadedThumbnailData) {
        formData.append('thumbnail', uploadedThumbnailData, 'thumb.jpg');
    }

    // Show progress
    uploadProgress.classList.remove('hidden');
    const progressFill = uploadProgress.querySelector('.progress-fill');
    const progressText = uploadProgress.querySelector('.progress-text');
    progressFill.style.width = '50%';
    progressText.textContent = currentLang === 'zh' ? '上传中...' : 'Uploading...';

    try {
        const token = localStorage.getItem('authToken');
        const uploadResponse = await fetch(`${API_BASE}/admin/photos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const result = await uploadResponse.json();

        if (uploadResponse.ok) {
            progressFill.style.width = '100%';
            progressText.textContent = '100%';

            showToast(currentLang === 'zh' ? '照片上传成功' : 'Photo uploaded successfully');

            setTimeout(async () => {
                hideUploadModal();

                // Reload collections to update photo counts
                await loadCollections();

                // Add to photo library
                if (currentCollectionId) {
                    await selectCollection(currentCollectionId);
                } else {
                    loadPhotoLibrary();
                }
            }, 1000);
        } else {
            throw new Error(result.error || (currentLang === 'zh' ? '上传失败' : 'Upload failed'));
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast((currentLang === 'zh' ? '上传失败: ' : 'Upload failed: ') + error.message, 'error');
        uploadProgress.classList.add('hidden');
    }
}

// ===== Layout Management =====
async function handleSaveLayout() {
    if (!currentCollectionId) {
        showToast(currentLang === 'zh' ? '请先选择一个相册' : 'Please select an album first', 'error');
        return;
    }

    try {
        showToast(currentLang === 'zh' ? '正在保存布局...' : 'Saving layout...');

        // Get current photos from canvas
        const photoElements = document.querySelectorAll('.canvas-photo');
        const photos = [];

        photoElements.forEach((el, index) => {
            const photoId = parseInt(el.dataset.id);
            const photo = libraryPhotos.find(p => p.id === photoId);
            if (photo) {
                // Use original positions if available, otherwise use current positions normalized by scale
                let layoutX, layoutY, layoutWidth, layoutHeight;
                if (el.dataset.originalX && el.dataset.originalY &&
                    el.dataset.originalWidth && el.dataset.originalHeight) {
                    layoutX = parseInt(el.dataset.originalX);
                    layoutY = parseInt(el.dataset.originalY);
                    layoutWidth = parseInt(el.dataset.originalWidth);
                    layoutHeight = parseInt(el.dataset.originalHeight);
                } else {
                    // Normalize current positions by scale
                    layoutX = Math.round(parseInt(el.style.left) / canvasScale);
                    layoutY = Math.round(parseInt(el.style.top) / canvasScale);
                    layoutWidth = Math.round(parseInt(el.style.width) / canvasScale);
                    layoutHeight = Math.round(parseInt(el.style.height) / canvasScale);
                }

                photos.push({
                    id: photo.id,
                    title: photo.title,
                    description: photo.description || '',
                    sort_order: index,
                    layout_x: layoutX,
                    layout_y: layoutY,
                    layout_width: layoutWidth,
                    layout_height: layoutHeight
                });
            }
        });

        if (photos.length === 0) {
            showToast(currentLang === 'zh' ? '没有照片可以保存' : 'No photos to save', 'error');
            return;
        }

        // Update each photo
        for (const photo of photos) {
            await apiRequest(`/admin/photos/${photo.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...photo,
                    collection_id: currentCollectionId
                }),
            });
        }

        showToast(currentLang === 'zh' ? '布局保存成功' : 'Layout saved');
    } catch (error) {
        console.error('Save layout error:', error);
        showToast((currentLang === 'zh' ? '保存失败: ' : 'Save failed: ') + error.message, 'error');
    }
}

function handlePreview() {
    // Store current admin state in sessionStorage
    sessionStorage.setItem('returnToAdmin', 'true');
    if (currentCollectionId) {
        sessionStorage.setItem('previewCollectionId', currentCollectionId.toString());
    }
    window.open(currentCollectionId ? `/?collection=${currentCollectionId}` : '/', '_blank');
}

// ===== Auth =====
async function handleLogout() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }

    localStorage.removeItem('authToken');
    showToast(currentLang === 'zh' ? '已退出登录' : 'Logged out');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

async function handleChangePassword(e) {
    e.preventDefault();

    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!currentPassword) {
        showToast(currentLang === 'zh' ? '请输入当前密码' : 'Please enter current password', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showToast(currentLang === 'zh' ? '新密码长度至少为 8 位' : 'New password must be at least 8 characters', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast(currentLang === 'zh' ? '两次输入的密码不一致' : 'Passwords do not match', 'error');
        return;
    }

    try {
        await apiRequest('/admin/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        showToast(currentLang === 'zh' ? '密码修改成功' : 'Password changed successfully');
        hideChangePasswordModal();
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
    } catch (error) {
        showToast(error.message || (currentLang === 'zh' ? '修改密码失败' : 'Failed to change password'), 'error');
    }
}

function showChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    modal.classList.add('active');
}

function hideChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    modal.classList.remove('active');
}

// ===== Photo Detail Modal =====
async function openPhotoDetail(photoId) {
    try {
        const photo = await apiRequest(`/photos/${photoId}`);
        detailPhotoId = photoId;

        const detailPhoto = document.getElementById('detailPhoto');
        const titleInput = document.getElementById('detailPhotoTitle');
        const descriptionInput = document.getElementById('detailPhotoDescription');
        const collectionSelect = document.getElementById('detailPhotoCollection');

        // Use thumbnail for admin photo detail modal
        detailPhoto.src = `/thumbnails/${photo.filename}`;
        detailPhoto.alt = photo.title;
        titleInput.value = photo.title;
        descriptionInput.value = photo.description || '';

        // Load collections and set current collection
        const collectionsData = await apiRequest('/collections');
        const t = translations[currentLang];
        collectionSelect.innerHTML = collectionsData.collections.map(c =>
            `<option value="${c.id}">${c.name}</option>`
        ).join('');

        // Set the photo's actual collection from database, not currentCollectionId
        if (photo.collection_id) {
            collectionSelect.value = photo.collection_id;
        }

        // Display EXIF information
        const cameraMake = photo.camera_make;
        const cameraModel = photo.camera_model;
        document.getElementById('detailExifCamera').textContent = (cameraMake && cameraModel) ? `${cameraMake} ${cameraModel}` : (cameraMake || cameraModel || '-');
        document.getElementById('detailExifLens').textContent = photo.lens_model || '-';
        document.getElementById('detailExifISO').textContent = photo.iso ? `${photo.iso}` : '-';
        document.getElementById('detailExifAperture').textContent = photo.aperture ? `f/${photo.aperture.replace(/^f\//, '').replace(/^f/, '')}` : '-';
        document.getElementById('detailExifShutter').textContent = photo.shutter_speed || '-';
        document.getElementById('detailExifFocal').textContent = photo.focal_length ? `${photo.focal_length.replace(/mm$/, '')}mm` : '-';
        document.getElementById('detailExifDate').textContent = photo.datetime_taken || '-';

        // Display GPS coordinates if available
        const detailExifGPS = document.getElementById('detailExifGPS');
        const detailExifGPSItem = document.getElementById('detailExifGPSItem');
        if (detailExifGPS && detailExifGPSItem) {
            if (photo.gps_latitude !== null && photo.gps_longitude !== null) {
                detailExifGPS.textContent = `${photo.gps_latitude.toFixed(6)}, ${photo.gps_longitude.toFixed(6)}`;
                detailExifGPSItem.style.display = 'flex';
            } else {
                detailExifGPSItem.style.display = 'none';
            }
        }

        // Show/hide EXIF section based on data availability
        const exifSection = document.getElementById('detailPhotoExif');
        const hasExif = photo.camera_make || photo.camera_model || photo.lens_model ||
                      photo.iso || photo.aperture || photo.shutter_speed ||
                      photo.focal_length || photo.datetime_taken ||
                      (photo.gps_latitude !== null && photo.gps_longitude !== null);
        exifSection.style.display = hasExif ? 'block' : 'none';

        photoDetailModal.classList.add('active');
    } catch (error) {
        console.error('Failed to load photo:', error);
        showToast(currentLang === 'zh' ? '加载照片失败' : 'Failed to load photo', 'error');
    }
}

function hidePhotoDetailModal() {
    photoDetailModal.classList.remove('active');
    detailPhotoId = null;
}

async function handleDeletePhoto() {
    if (!detailPhotoId) return;

    const t = translations[currentLang];
    if (!confirm(t.photoDeletedConfirm)) {
        return;
    }

    try {
        await apiRequest(`/admin/photos/${detailPhotoId}`, {
            method: 'DELETE',
        });

        showToast(t.photoDeleted);
        hidePhotoDetailModal();

        // Reload collections to update photo counts
        await loadCollections();

        // Reload photo library and canvas
        if (currentCollectionId) {
            await selectCollection(currentCollectionId);
        }
    } catch (error) {
        console.error('Delete photo error:', error);
        showToast((currentLang === 'zh' ? '删除失败: ' : 'Delete failed: ') + error.message, 'error');
    }
}

async function handlePhotoDetailSubmit(e) {
    e.preventDefault();

    if (!detailPhotoId) return;

    const titleInput = document.getElementById('detailPhotoTitle');
    const descriptionInput = document.getElementById('detailPhotoDescription');
    const collectionSelect = document.getElementById('detailPhotoCollection');

    if (!titleInput || !descriptionInput || !collectionSelect) {
        showToast(currentLang === 'zh' ? '表单错误' : 'Form error', 'error');
        return;
    }

    const title = titleInput.value.trim();
    const description = descriptionInput.value;
    const collectionId = collectionSelect.value ? parseInt(collectionSelect.value, 10) : null;

    if (!title) {
        showToast(currentLang === 'zh' ? '请输入照片标题' : 'Please enter photo title', 'error');
        return;
    }

    try {
        await apiRequest(`/admin/photos/${detailPhotoId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: title,
                description: description,
                collection_id: collectionId
            }),
        });

        showToast(currentLang === 'zh' ? '照片更新成功' : 'Photo updated successfully');
        hidePhotoDetailModal();

        // Reload collections to update photo counts
        await loadCollections();

        // Reload photo library and canvas
        if (currentCollectionId) {
            await selectCollection(currentCollectionId);
        } else {
            await loadPhotoLibrary();
        }
    } catch (error) {
        console.error('Update photo error:', error);
        showToast((currentLang === 'zh' ? '更新失败: ' : 'Update failed: ') + error.message, 'error');
    }
}

// Make openPhotoDetail global
window.openPhotoDetail = openPhotoDetail;

// ===== Site Settings Functions =====
async function showSiteSettingsModal() {
    const modal = document.getElementById('siteSettingsModal');

    try {
        const data = await apiRequest('/site-settings');
        const settings = data.settings || {};

        document.getElementById('siteTitle').value = settings.title || 'PhotoBlog';
        document.getElementById('siteLogo').value = settings.logo || 'LINTHU';
        document.getElementById('authorName').value = settings.author_name || 'Lin';
        document.getElementById('contact').value = settings.contact || 'DPICW_WY@163.com';
        document.getElementById('aboutText').value = settings.about || '这是一个"相册展示系统"';
        document.getElementById('icpNumber').value = settings.icp_number || '';
        document.getElementById('showICP').checked = settings.show_icp === 1 || settings.show_icp === true;
        document.getElementById('welcomeMessage').value = settings.welcome_message || 'HELLO!';
    } catch (error) {
        console.error('Failed to load site settings:', error);
        // Set default values
        document.getElementById('siteTitle').value = 'PhotoBlog';
        document.getElementById('siteLogo').value = 'LINTHU';
        document.getElementById('authorName').value = 'Lin';
        document.getElementById('contact').value = 'DPICW_WY@163.com';
        document.getElementById('aboutText').value = '这是一个"相册展示系统"';
        document.getElementById('icpNumber').value = '';
        document.getElementById('showICP').checked = false;
        document.getElementById('welcomeMessage').value = 'HELLO!';
    }

    modal.classList.add('active');
}

function hideSiteSettingsModal() {
    const modal = document.getElementById('siteSettingsModal');
    modal.classList.remove('active');
    document.getElementById('siteSettingsForm').reset();
}

async function handleSiteSettingsSave(e) {
    e.preventDefault();

    const t = translations[currentLang];
    const title = document.getElementById('siteTitle').value.trim();
    const logo = document.getElementById('siteLogo').value.trim();
    const authorName = document.getElementById('authorName').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const about = document.getElementById('aboutText').value.trim();
    const icpNumber = document.getElementById('icpNumber').value.trim();
    const showICP = document.getElementById('showICP').checked;
    const welcomeMessage = document.getElementById('welcomeMessage').value.trim();

    if (!title || !logo || !authorName || !contact || !about) {
        showToast(currentLang === 'zh' ? '请填写所有字段' : 'Please fill all fields', 'error');
        return;
    }

    try {
        await apiRequest('/admin/site-settings', {
            method: 'PUT',
            body: JSON.stringify({
                title,
                logo,
                author_name: authorName,
                contact,
                about,
                icp_number: icpNumber,
                show_icp: showICP,
                welcome_message: welcomeMessage
            }),
        });

        showToast(t.settingsSaved);
        hideSiteSettingsModal();
        updateAdminFooter();
    } catch (error) {
        showToast((currentLang === 'zh' ? '更新失败: ' : 'Update failed: ') + error.message, 'error');
    }
}

function updateAdminFooter() {
    apiRequest('/site-settings').then(data => {
        const settings = data.settings || {};
        const adminFooterCopyright = document.getElementById('adminFooterCopyright');
        const adminIcpDisplay = document.getElementById('adminIcpDisplay');

        if (adminFooterCopyright) {
            adminFooterCopyright.textContent = settings.title || '摄影作品集';
        }

        if (adminIcpDisplay) {
            if (settings.show_icp && settings.icp_number) {
                adminIcpDisplay.textContent = settings.icp_number;
                adminIcpDisplay.classList.remove('hidden');
            } else {
                adminIcpDisplay.classList.add('hidden');
            }
        }
    }).catch(console.error);
}

// ===== Collection Settings Functions =====
function showCollectionSettingsModal(collectionId) {
    const t = translations[currentLang];

    // Load collection data
    apiRequest(`/collections/${collectionId}`).then(data => {
        const collection = data.collection;

        document.getElementById('collectionSettingsName').value = collection.name;
        document.getElementById('collectionSettingsDescription').value = collection.description || '';

        // Store current collection ID
        document.getElementById('collectionSettingsForm').dataset.collectionId = collectionId;

        // Update language UI for the modal
        const collectionSettingsModal = document.getElementById('collectionSettingsModal');
        if (collectionSettingsModal) {
            collectionSettingsModal.querySelector('h2').textContent = t.collectionSettings;
            document.querySelector('label[for="collectionSettingsName"]').textContent = t.collectionName;
            document.getElementById('collectionSettingsName').placeholder = t.collectionNamePlaceholder;
            document.querySelector('label[for="collectionSettingsDescription"]').textContent = t.collectionDescription;
            document.getElementById('collectionSettingsDescription').placeholder = t.collectionDescriptionPlaceholder;
            document.getElementById('deleteCollectionBtn').textContent = t.deleteCollectionBtn;
            document.getElementById('cancelCollectionSettingsBtn').textContent = t.cancel;
            document.querySelector('#collectionSettingsForm button[type="submit"]').textContent = t.saveCollection;
        }

        document.getElementById('collectionSettingsModal').classList.add('active');
    }).catch(error => {
        console.error('Failed to load collection:', error);
        showToast(currentLang === 'zh' ? '加载失败' : 'Load failed', 'error');
    });
}

function hideCollectionSettingsModal() {
    document.getElementById('collectionSettingsModal').classList.remove('active');
}

async function handleCollectionSettingsSave(e) {
    e.preventDefault();

    const t = translations[currentLang];
    const form = e.target;
    const collectionId = parseInt(form.dataset.collectionId, 10);
    const name = document.getElementById('collectionSettingsName').value.trim();
    const description = document.getElementById('collectionSettingsDescription').value;

    if (!name) {
        showToast(currentLang === 'zh' ? '请输入相册名称' : 'Please enter album name', 'error');
        return;
    }

    try {
        // Update collection in database
        const result = await apiRequest(`/admin/collections/${collectionId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: name,
                description: description
            }),
        });

        showToast(t.collectionUpdated);
        hideCollectionSettingsModal();

        // Reload collection list to update the data
        await loadCollections();

        // Update current collection name in the DOM if it's selected
        if (currentCollectionId === collectionId) {
            const collectionItems = document.querySelectorAll('.collection-item');
            collectionItems.forEach(item => {
                const itemId = parseInt(item.dataset.id, 10);
                if (itemId === collectionId) {
                    item.querySelector('.collection-item-name').textContent = name;
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    } catch (error) {
        console.error('Failed to save collection:', error);
        const errorMsg = error.message || (currentLang === 'zh' ? '未知错误' : 'Unknown error');
        showToast((currentLang === 'zh' ? '更新失败: ' : 'Update failed: ') + errorMsg, 'error');
    }
}

async function handleDeleteCollection() {
    const form = document.getElementById('collectionSettingsForm');
    const collectionId = parseInt(form.dataset.collectionId, 10);
    const t = translations[currentLang];

    if (!confirm(t.collectionDeletedConfirm)) {
        return;
    }

    try {
        await apiRequest(`/admin/collections/${collectionId}`, {
            method: 'DELETE',
        });

        showToast(t.collectionDeleted);
        hideCollectionSettingsModal();
        loadCollections(); // Reload collection list

        // Clear current collection if it was deleted
        if (currentCollectionId === collectionId) {
            currentCollectionId = null;
            canvas.innerHTML = `
                <div class="canvas-placeholder">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    <p>${t.selectCollection}</p>
                    <p class="hint">${t.selectCollectionHint}</p>
                </div>
            `;
            photoLibrary.innerHTML = '';
            photoLibrarySection.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to delete collection:', error);

        // Handle specific error for non-empty collections
        if (error.message && error.message.includes('Cannot delete collection with photos')) {
            showToast(t.collectionNotEmpty, 'error');
            return;
        }

        showToast((currentLang === 'zh' ? '删除失败: ' : 'Delete failed: ') + error.message, 'error');
    }
}

// ===== Global Drag and Drop =====
let selectedPhoto = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let isResizing = false;
let resizeHandle = null;
let initialResize = { x: 0, y: 0, width: 0, height: 0 };
let lastDropPosition = { x: 0, y: 0 };

function setupGlobalDragDrop() {
    const adminEditor = document.querySelector('.admin-editor');
    const uploadPreview = document.querySelector('.upload-preview');

    // Prevent default drag behaviors on the entire admin editor
    if (adminEditor) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            adminEditor.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Handle drop on canvas
        adminEditor.addEventListener('drop', async (e) => {
            const canvasRect = canvas.getBoundingClientRect();
            lastDropPosition.x = e.clientX - canvasRect.left;
            lastDropPosition.y = e.clientY - canvasRect.top;

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    // Check if a collection is selected
                    if (!currentCollectionId) {
                        showToast(currentLang === 'zh' ? '请先选择一个相册' : 'Please select an album first', 'error');
                        return;
                    }

                    try {
                        const imageDataUrl = await readFileAsDataURL(file);
                        showUploadModal(imageDataUrl, file.name);
                    } catch (error) {
                        console.error('Failed to read file:', error);
                        showToast(currentLang === 'zh' ? '读取文件失败' : 'Failed to read file', 'error');
                    }
                } else {
                    showToast(currentLang === 'zh' ? '请拖入图片文件' : 'Please drag an image file', 'error');
                }
            }
        });

        // Handle mouse move for dragging and resizing
        adminEditor.addEventListener('mousemove', handleMouseMove);
        adminEditor.addEventListener('mouseup', handleMouseUp);

        // Click on canvas to deselect
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas) {
                deselectPhoto();
            }
        });
    }

    // Handle drop on upload preview (when modal is open)
    if (uploadPreview) {
        uploadPreview.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    try {
                        const imageDataUrl = await readFileAsDataURL(file);
                        showUploadModal(imageDataUrl, file.name);
                    } catch (error) {
                        console.error('Failed to read file:', error);
                        showToast(currentLang === 'zh' ? '读取文件失败' : 'Failed to read file', 'error');
                    }
                } else {
                    showToast(currentLang === 'zh' ? '请拖入图片文件' : 'Please drag an image file', 'error');
                }
            }
        });
    }
}

function handleMouseMove(e) {
    if (!selectedPhoto) return;

    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    if (isDragging) {
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;
        selectedPhoto.style.left = newX + 'px';
        selectedPhoto.style.top = newY + 'px';
        // Update original positions to maintain layout across zoom changes
        selectedPhoto.dataset.originalX = Math.round(newX / canvasScale);
        selectedPhoto.dataset.originalY = Math.round(newY / canvasScale);
    } else if (isResizing && resizeHandle) {
        const dx = x - initialResize.x;
        const dy = y - initialResize.y;

        const currentWidth = parseInt(selectedPhoto.style.width);
        const currentHeight = parseInt(selectedPhoto.style.height);

        if (resizeHandle === 'se') {
            const newWidth = Math.max(50, initialResize.width + dx);
            const newHeight = Math.max(50, initialResize.height + dy);
            selectedPhoto.style.width = newWidth + 'px';
            selectedPhoto.style.height = newHeight + 'px';
            // Update original dimensions
            selectedPhoto.dataset.originalWidth = Math.round(newWidth / canvasScale);
            selectedPhoto.dataset.originalHeight = Math.round(newHeight / canvasScale);
        }
    }
}

async function handleMouseUp(e) {
    if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;

        // Auto-save layout after moving/resizing
        if (currentCollectionId) {
            await handleSaveLayout();
        }
    }
}

function selectPhotoOnCanvas(el) {
    // Remove selection from all photos
    document.querySelectorAll('.canvas-photo').forEach(photo => {
        photo.classList.remove('selected');
        // Remove resize handles
        const existingHandles = photo.querySelectorAll('.resize-handle');
        existingHandles.forEach(h => h.remove());
    });

    // Add selection to clicked photo
    el.classList.add('selected');
    selectedPhoto = el;

    // Add resize handles
    addResizeHandles(el);
}

function deselectPhoto() {
    document.querySelectorAll('.canvas-photo').forEach(photo => {
        photo.classList.remove('selected');
        const existingHandles = photo.querySelectorAll('.resize-handle');
        existingHandles.forEach(h => h.remove());
    });
    selectedPhoto = null;
}

function addResizeHandles(el) {
    const handleSize = 10;
    const handleSE = document.createElement('div');
    handleSE.className = 'resize-handle resize-handle-se';
    handleSE.style.cssText = `
        position: absolute;
        right: -${handleSize / 2}px;
        bottom: -${handleSize / 2}px;
        width: ${handleSize}px;
        height: ${handleSize}px;
        background: #3b82f6;
        cursor: se-resize;
        z-index: 1000;
    `;

    handleSE.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isResizing = true;
        resizeHandle = 'se';
        const canvasRect = canvas.getBoundingClientRect();
        initialResize = {
            x: e.clientX - canvasRect.left,
            y: e.clientY - canvasRect.top,
            width: parseInt(el.style.width),
            height: parseInt(el.style.height)
        };
    });

    el.appendChild(handleSE);
}

// ===== Canvas Zoom Functions =====
function handleZoomOut() {
    if (canvasScale > minScale) {
        canvasScale = Math.max(minScale, canvasScale - 0.25);
        updateCanvasScale();
    }
}

function handleZoomIn() {
    if (canvasScale < maxScale) {
        canvasScale = Math.min(maxScale, canvasScale + 0.25);
        updateCanvasScale();
    }
}

function handleZoomFit() {
    const canvasPhotos = document.querySelectorAll('.canvas-photo');
    if (canvasPhotos.length === 0) return;

    // Calculate bounding box of all photos using original positions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    canvasPhotos.forEach(photo => {
        const x = parseInt(photo.dataset.originalX) || parseInt(photo.style.left) || 0;
        const y = parseInt(photo.dataset.originalY) || parseInt(photo.style.top) || 0;
        const width = parseInt(photo.dataset.originalWidth) || parseInt(photo.style.width) || 250;
        const height = parseInt(photo.dataset.originalHeight) || parseInt(photo.style.height) || 250;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    });

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    const contentWidth = maxX - minX + 100; // Add padding
    const contentHeight = maxY - minY + 100;

    const scaleX = (canvasWidth - 100) / contentWidth;
    const scaleY = (canvasHeight - 100) / contentHeight;

    canvasScale = Math.min(Math.max(minScale, Math.min(scaleX, scaleY)), maxScale);
    updateCanvasScale();
}

function updateCanvasScale() {
    const canvasPhotos = document.querySelectorAll('.canvas-photo');
    canvasPhotos.forEach(photo => {
        const originalX = parseInt(photo.dataset.originalX) || parseInt(photo.style.left);
        const originalY = parseInt(photo.dataset.originalY) || parseInt(photo.style.top);
        const originalWidth = parseInt(photo.dataset.originalWidth) || parseInt(photo.style.width);
        const originalHeight = parseInt(photo.dataset.originalHeight) || parseInt(photo.style.height);

        // Apply scale to position and size to maintain relative distances
        photo.style.left = (originalX * canvasScale) + 'px';
        photo.style.top = (originalY * canvasScale) + 'px';
        photo.style.width = (originalWidth * canvasScale) + 'px';
        photo.style.height = (originalHeight * canvasScale) + 'px';
        photo.style.transform = 'none';
    });

    document.getElementById('zoomLevel').textContent = Math.round(canvasScale * 100) + '%';
}
