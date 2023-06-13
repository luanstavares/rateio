import React, { useState, useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { CheckSquare, Square } from "phosphor-react";
import { Avatar } from "@mui/material";

const icon = <Square />;
const checkedIcon = <CheckSquare />;

export default function FriendList(props) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      const myHeaders = new Headers();
      myHeaders.append("app-id", process.env.NEXT_PUBLIC_DUMMY_APP_ID);
      await fetch("https://dummyapi.io/data/v1/user", { headers: myHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (active) {
            setOptions([...data.data]);
          }
        });
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      limitTags={2}
      multiple
      size="small"
      id="checkboxes-tags-demo"
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onChange={(e, value) => {
        props.users(value);
      }}
      ChipProps={{ variant: "outlined" }}
      options={options}
      loading={loading}
      disableCloseOnSelect
      getOptionLabel={(option) => option.firstName + " " + option.lastName}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            size="small"
            name="checkboxes-tags"
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          <Avatar
            size="small"
            sx={{ margin: "0 15px" }}
            src={option.picture}
          />
          {option.firstName} {option.lastName}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Convidar Amigos"
          placeholder="Convidados"
          InputProps={{
            ...params.InputProps,

            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress
                    color="inherit"
                    size={20}
                  />
                ) : null}

                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
