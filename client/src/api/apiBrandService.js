import apiHelper from '../api/apiHelper';

const apiBrandService = {
    getLists: (params) => {
        const paramsSearch = new URLSearchParams(params);
        return apiHelper.get(`brand?${paramsSearch.toString()}`);
    },
    getById: (id) => {
        return apiHelper.get(`brand/show/${id}`);
    },
};

export default apiBrandService;
