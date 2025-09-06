// Validation helper functions for form validation

export const validateName = (name) => {
    if (!name || name.trim().length === 0) {
        return 'Họ và tên không được để trống';
    }
    if (name.trim().length < 2) {
        return 'Họ và tên phải có ít nhất 2 ký tự';
    }
    if (name.trim().length > 50) {
        return 'Họ và tên không được vượt quá 50 ký tự';
    }
    // Kiểm tra ký tự đặc biệt
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    if (!nameRegex.test(name.trim())) {
        return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
    }
    return '';
};

export const validateEmail = (email) => {
    if (!email || email.trim().length === 0) {
        return 'Email không được để trống';
    }
    if (email.length > 100) {
        return 'Email không được vượt quá 100 ký tự';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Email không đúng định dạng';
    }
    return '';
};

export const validatePhone = (phone) => {
    if (!phone || phone.trim().length === 0) {
        return 'Số điện thoại không được để trống';
    }
    
    // Loại bỏ khoảng trắng và ký tự đặc biệt
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[-()]/g, '');
    
    // Kiểm tra độ dài và ký tự
    if (!/^\d{10,11}$/.test(cleanPhone)) {
        return 'Số điện thoại phải có 10-11 chữ số';
    }
    
    // Kiểm tra số điện thoại Việt Nam
    const vietnamPhoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!vietnamPhoneRegex.test(cleanPhone)) {
        return 'Số điện thoại không đúng định dạng Việt Nam (bắt đầu với 03, 05, 07, 08, 09)';
    }
    
    return '';
};

export const validateAddress = (address) => {
    if (!address || address.trim().length === 0) {
        return 'Địa chỉ không được để trống';
    }
    if (address.trim().length < 10) {
        return 'Địa chỉ phải có ít nhất 10 ký tự';
    }
    if (address.trim().length > 200) {
        return 'Địa chỉ không được vượt quá 200 ký tự';
    }
    return '';
};

// Validation cho payment method
export const validatePaymentMethod = (paymentMethod) => {
    if (!paymentMethod) {
        return 'Vui lòng chọn phương thức thanh toán';
    }
    return '';
};

// Validation tổng hợp
export const validateCheckoutForm = (userInfo, paymentMethod) => {
    const errors = {};
    
    const nameError = validateName(userInfo.name);
    if (nameError) errors.name = nameError;
    
    const emailError = validateEmail(userInfo.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhone(userInfo.phone);
    if (phoneError) errors.phone = phoneError;
    
    const addressError = validateAddress(userInfo.address);
    if (addressError) errors.address = addressError;
    
    const paymentError = validatePaymentMethod(paymentMethod);
    if (paymentError) errors.paymentMethod = paymentError;
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Format phone number khi hiển thị
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
        return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    if (cleanPhone.length === 11) {
        return cleanPhone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
};

// Validate tức thì cho từng trường
export const validateField = (fieldName, value) => {
    switch (fieldName) {
        case 'name':
            return validateName(value);
        case 'email':
            return validateEmail(value);
        case 'phone':
            return validatePhone(value);
        case 'address':
            return validateAddress(value);
        case 'paymentMethod':
            return validatePaymentMethod(value);
        default:
            return '';
    }
}; 