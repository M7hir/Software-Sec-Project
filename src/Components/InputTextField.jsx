import { TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

const InputTextField = ({ name, label,helperText, ...props }) => {
  const methods = useFormContext();
  return (
    <Controller
      control={methods.control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        // console.log("Rendering InputTextField with error:", error);
        // console.log("Field values:", field);
        return(
        <TextField
          {...field}
          label={label}
          {...props}
          error={!!error}
          helperText={error?.message ?? helperText}
        />
      )}
      
    }
    />
  );
};

export { InputTextField };
