const nodemailer = require("nodemailer");
const moment = require("moment");

exports.forgotPasswordMail = async (data) => {
	try {
		// Gửi email chứa token
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		});

		const resetUrl = `http://localhost:3000/reset-password/${data?.resetToken}`;
		const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Đặt lại mật khẩu của bạn</h2>
                <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin-top: 20px; color: #fff; background-color: #007bff; border-radius: 5px; text-decoration: none;">Đặt lại mật khẩu</a>
                <p style="margin-top: 20px;">Hoặc, bạn có thể sao chép và dán đường link sau vào trình duyệt của mình:</p>
                <p><a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a></p>
                <p>Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,<br/>Đội ngũ hỗ trợ của chúng tôi</p>
            </div>
        `;

		const mailOptions = {
			to: data.email,
			from: "codethue94@gmail.com",
			subject: "Đặt lại mật khẩu",
			html: htmlTemplate,
		};

		transporter.sendMail(mailOptions);

		// Trả về token và thông tin người dùng
	} catch (err) {
		console.error("Quên mật khẩu: ", err.message);
	}
};

exports.registerMail = async (data) => {
	try {
		// Gửi email chứa token
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		});
		const htmlTemplate = `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
						<h2 style="color: #333;">Kích hoạt tài khoản</h2>
						<p>Nhấn vào nút bên dưới để tiến hành kích hoạt tài khoản:</p>
						<a href="${data?.link}" style="display: inline-block; padding: 10px 20px; margin-top: 20px; color: #fff; background-color: #007bff; border-radius: 5px; text-decoration: none;">Kích hoạt</a>
						<p style="margin-top: 20px;">Hoặc, bạn có thể sao chép và dán đường link sau vào trình duyệt của mình:</p>
						<p><a href="${data?.link}" target="_blank" style="color: #007bff;">${data?.link}</a></p>
						<p>Trân trọng,<br/>Đội ngũ hỗ trợ của chúng tôi</p>
					</div>
				`;

		const mailOptions = {
			to: data?.email,
			from: "barbershop@gmail.com",
			subject: "Kích hoạt tài khoản",
			html: htmlTemplate,
		};

		transporter.sendMail(mailOptions);

		// Trả về token và thông tin người dùng
	} catch (err) {
		console.error("Đăng ký: ", err.message);
	}
};

const genTemplateWSOrder = (products) => {
	let text = "";
	if (products?.length > 0) {
		products.forEach((item) => {
			let type = "";
			if (item.type == 2) type = "[Sample] ";
			text +=
				item.qty + " x " + type + item.name + " " + formatCurrency(item.price) + "<br>";
		});
	}
	return text;
};

const formatCurrency = (value) => {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(value);
};

exports.orderMail = async (data) => {
	try {
		console.log(process.env.MAIL_USERNAME, process.env.MAIL_PASSWORD);
		// Gửi email chứa token
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		});
		console.log("============= data: ", data);
		const htmlTemplate = `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
						<h2 style="color: #333;">Đặt hàng thành công</h2>
                    <br>
                                      
                    <div style='margin-top: 0; color:#000;'>Ngày đặt: ${moment(
						data?.created_at
					).format("DD/MM/yyyy HH:mm")}</div>
                    <br>
                    <div style=' color:#000;'>Tên khách hàng: ${
						data.user_name || data?.meta_data?.user_name || ""
					}</div>
                    <div style=' color:#000;'>Email: <a style='color: #007bff !important;text-decoration: none;'>${
						data.user_email || data?.meta_data?.user_email || ""
					}</a></div>
                    <div style=' color:#000;'>Phone: ${
						data.user_phone || data?.meta_data?.user_phone || ""
					}</div>
                    <br>
					<div style=' color:#000;'>Hình thức thanh toán: ${data.payment_method_id == 1 ? 'COD' : 'ONLINE'}</div>
					<div style=' color:#000;'>Trạng thái: ${
						(data.payment_status == "completed" &&
							"Đã thanh toán") ||
						"Chưa thanh toán"
					}</div>
                    <div style='font-weight: 700; color:#000;'>Sản phẩm</div>
                    <div style=' color:#000;'>${genTemplateWSOrder(
						data.products
					)}</div>
                    <br>
                    <div style='color:#000;'>Total: ${formatCurrency(
						data.sub_total
					)}</div>
						<p>Trân trọng,<br/>Đội ngũ hỗ trợ của chúng tôi</p>
					</div>
				`;
					console.log(htmlTemplate);
		const mailOptions = {
			to: data?.meta_data?.user_email || data?.user_email,
			from: "codethue94@gmail.com",

			bcc: "codethue94@gmail.com",
			subject: `Đơn hàng của bạn đã được đặt thành công  ${
				data?.code ? "#" + data?.code : ""
			}`,
			html: htmlTemplate,
		};

		transporter.sendMail(mailOptions);

		// Trả về token và thông tin người dùng
	} catch (err) {
		console.error("Gủi email thất bại: ", err.message);
	}
};
