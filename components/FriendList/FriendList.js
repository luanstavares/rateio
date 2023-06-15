"use client";
import React, { useState, useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { CheckSquare, Square } from "phosphor-react";
import { Avatar } from "@mui/material";
import Chip from "@mui/material/Chip";
const icon = <Square weight="light" />;
const checkedIcon = <CheckSquare weight="light" />;

export default function FriendList(props) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;
  const [value, setValue] = useState([]);
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
      fullWidth={true}
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
        setValue(value);
        props.users(value);
      }}
      value={value}
      options={options}
      loading={loading}
      disableCloseOnSelect
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.firstName + " " + option.lastName}
      renderOption={(props, option, { selected }) => (
        <li
          {...props}
          key={option.id}
        >
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
      renderTags={(option, getTagProps) => {
        const numTags = option.length;
        const limitTags = 2;
        return (
          <>
            {option.slice(0, limitTags).map((option, index) => (
              <Chip
                avatar={
                  <Avatar
                    alt={option.firstName}
                    src={option.picture}
                  />
                }
                variant="outlined"
                {...getTagProps({ index })}
                key={index}
                label={option.firstName + " " + option.lastName}
              />
            ))}

            {numTags > limitTags && ` +${numTags - limitTags}`}
          </>
        );
      }}
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
