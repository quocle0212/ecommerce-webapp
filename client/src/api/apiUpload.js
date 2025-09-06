import apiHelper from '../api/apiHelper';

const apiUpload = {
    uploadImage: (imageFile) => {
        const formData = new FormData();
        formData.append('file', imageFile);
        return apiHelper.post('/uploads/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

	uploadImageResponse: async (imageFile) => {
        try {
			const formData = new FormData();
			formData.append('file', imageFile);
			const response = await apiHelper.post('/uploads/image', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			console.log("response?.data---------> ", response);
			return response?.data;
		} catch (error) {
			return null;
		}
    },
};

export default apiUpload;
