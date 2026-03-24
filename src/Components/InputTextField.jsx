import { TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

const InputTextField = ({ name, label, helperText, rules, ...props }) => {
  const methods = useFormContext();
  return (
    <Controller
      control={methods.control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        return (
          <TextField
            {...field}
            label={label}
            {...props}
            error={!!error}
            helperText={error?.message ?? helperText}
          />
        );
      }}
    />
  );
};

export { InputTextField };
