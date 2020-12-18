import React from 'react';
import ReactDOM from 'react-dom';
import ButtonAppBar from './TopBar.jsx'
import ParameterTable from './parameters/ParameterTable.jsx'
import PlotContainer from './plotting/PlotContainer.jsx'
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import AlertSnackbar from './AlertSnackbar.jsx'
import { get } from './utilities.js'
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

const theme = createMuiTheme({
  palette: {
    primary: {main: "#67001a"},
    secondary: {main: '#004e67'}
  },
});

export default function App(props){
  return (
    <div>
    <ThemeProvider theme={theme}>
    <ButtonAppBar/>
    <Box m={4}>
    <Grid container spacing={4}>
      <Grid item xs>
        <ParameterTable snapshot={props.snapshot}/>
      </Grid>
      <Grid item xs>
        <PlotContainer/>
      </Grid>
    </Grid>
    </Box>
    <AlertSnackbar/>
    </ThemeProvider>
    </div>
  )
}
