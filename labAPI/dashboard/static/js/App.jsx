import React from 'react';
import ReactDOM from 'react-dom';
import ButtonAppBar from './TopBar.jsx'
import NetworkDisplay from './parameters/NetworkDisplay.jsx'
import PlotContainer from './plotting/PlotContainer.jsx'
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { get } from './utilities.js'
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { SnackbarProvider } from 'notistack';

const theme = createMuiTheme({
  palette: {
    primary: {main: "#67001a"},
    secondary: {main: '#004e67'}
  },
});

export default function App(props){
  return (
    <div>
      <SnackbarProvider maxSnack={3} preventDuplicate>
      <ThemeProvider theme={theme}>
      <ButtonAppBar/>
      <Box m={4}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <NetworkDisplay snapshot={props.snapshot}/>
        </Grid>
        <Grid item xs={6}>
          <PlotContainer/>
        </Grid>
      </Grid>
      </Box>
      </ThemeProvider>
    </SnackbarProvider>
    </div>
  )
}
