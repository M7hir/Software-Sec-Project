import { Autocomplete, TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

const InputAutoComplete = ({ name, label, helperText, options, ...props }) => {
    const methods = useFormContext();
  return (
    <Controller
      control={methods.control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        return (
              <Autocomplete
            // spread the rest of the field except onChange and value so we can
            // control them explicitly below
            disablePortal
            options={options}
            getOptionLabel={(option) => {
              if (option === null || option === undefined) return "";
              return typeof option === "string" ? option : String(option);
            }}
            sx={{ width: "100%" }}
            // ensure the form value is always the selected option (not an event or
            // unexpected primitive such as 0)
            value={field.value ?? null}
            onChange={(_, newValue) => field.onChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!error}
                helperText={error?.message ?? helperText}
                required
                label={label}
                fullWidth
              />
            )}
            {...props}
          />
        );
      }}
    />
  );
};

export  {InputAutoComplete};
