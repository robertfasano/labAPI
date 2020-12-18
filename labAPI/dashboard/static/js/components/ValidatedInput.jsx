import React from 'react'
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux'

export default function ValidatedInputLite({placeholder, min, max, onKeyPress}) {
  const [defaultVal, setDefaultVal] = React.useState(placeholder)
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

      setDefaultVal(event.target.value)
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
                 style={{width: 60}}
                 />
  )
}
