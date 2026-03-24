import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Controller, useFormContext } from "react-hook-form";

const InputDateAndTimePicker = ({ name, label, helperText, rules, ...props }) => {
  const methods = useFormContext();
  return (
    <Controller
      name={name}
      control={methods.control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              {...field}
              sx={{ width: "100%" }}
              label={label}
              slotProps={{
                error: !!error,
                helperText: helperText || error?.message,
              }}
              {...props}
            />
          </LocalizationProvider>
        );
      }}
    />
  );
};

export { InputDateAndTimePicker };
