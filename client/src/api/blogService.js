import apiHelper from './apiHelper';

const blogService = {
    // Lấy danh sách bài viết
    getAll: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return apiHelper.get(`posts?${searchParams.toString()}`);
    },

    // Lấy chi tiết bài viết theo ID
    getById: (id) => {
        return apiHelper.get(`posts/show/${id}`);
    },

    // Lấy chi tiết bài viết theo slug
    getBySlug: (slug) => {
        return apiHelper.get(`posts/show-slug/${slug}`);
    },

    // Lấy bài viết theo menu/category
    getByMenu: (menuId, params = {}) => {
        const searchParams = new URLSearchParams({
            ...params,
            menu_id: menuId
        });
        return apiHelper.get(`posts?${searchParams.toString()}`);
    },

    // Lấy danh sách menu cho blog
    getMenus: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return apiHelper.get(`menus?${searchParams.toString()}`);
    }
};

export default blogService;
