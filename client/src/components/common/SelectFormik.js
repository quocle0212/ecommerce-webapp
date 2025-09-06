import React, { useState } from "react";

import { Field } from "formik";

export const SelectForm = (props) => {
	return (
		<Field name={props.name} as="select" className="form-control">
			<option value="">Chọn giá trị</option>
			{props.options.map((opt) => (
				<option key={opt.value} value={opt.value}>
					{opt.label}
				</option>
			))}
		</Field>
	);
};
