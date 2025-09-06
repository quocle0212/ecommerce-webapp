import apiHelper from '../api/apiHelper';

const apiOrderService = {
    add: (data) => {
        return apiHelper.post('order', data);
    },
    createOrder: (data) => {
        return apiHelper.post(`admin/order`,data);
    },
    updateOrder: (id, data) => {
        return apiHelper.put(`admin/order/${id}`,data);
    },
    getListsAdmin: (params) => {
        const paramsSearch = new URLSearchParams(params);
        return apiHelper.get(`admin/order?${paramsSearch.toString()}`);
    },
    getLists: (params) => {
        const paramsSearch = new URLSearchParams(params);
        return apiHelper.get(`user/order?${paramsSearch.toString()}`);
    },
    updateStatusPayment: (data) => {
        return apiHelper.post(`order/update-status-payment`, data);
    },
    deleteOrder: (id) => {
        return apiHelper.delete(`user/order/${id}`);
    },
    delete: (id) => {
        return apiHelper.delete(`admin/order/${id}`);
    },
    updateOrderStatus: (id, data) => {
        return apiHelper.post(`admin/order/update-status/${id}`,data);
    },
    getPaymentMethods: () => {
        return apiHelper.get(`payment-methods`);
    },
    getById: (id) => {
        return apiHelper.get(`user/order/${id}`);
    },
    cancelOrder: (id) => {
        return apiHelper.post(`user/order/cancel/${id}`);
    },
};

export default apiOrderService;
