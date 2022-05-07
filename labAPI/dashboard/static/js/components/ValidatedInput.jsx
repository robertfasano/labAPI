import React from 'react'
import TextField from '@mui/material/TextField';

export default function ValidatedInputLite({placeholder, min, max, onKeyPress}) {
  let defaultVal = placeholder
  const [value, setValue] = React.useState('')

  const [error, setError] = React.useState(false)
  const [errorText, setErrorText] = React.useState('')

  function update(newValue) {
    let stringValue = newValue.toString()
    if (stringValue.length == 0) {
      stringValue = defaultVal
    }
    setValue(stringValue)
    validate(parseFloat(stringValue))
  }

  function handleKeyPress(event) {
    if (event.key == 'Enter') {

      if (error) {
        return
      }

      event.preventDefault();
      event.stopPropagation();
      onKeyPress(event)
      defaultVal = event.target.value
      setValue('')
    }
  }

  function validate(newValue) {
    let newError = true
    let newErrorText = ' '
    if (newValue < min || newValue > max) { newErrorText = 'Must be in range ' + `[${min}, ${max}]` + '.'}
    else if (!isFinite(newValue)) { newErrorText = 'Invalid value.' }
    else {
      newError = false
      newErrorText = ' '
    }

    setError(newError)
    setErrorText(newErrorText)
  }

  return (
      <TextField onChange={(event) => update(event.target.value)}
                 value={value}
                 placeholder={(defaultVal).toString()}
                 error={error}
                 helperText={errorText}
                 onKeyUp={handleKeyPress}
                 style={{width: 100}}
                 variant='standard'
                 />
  )
}
