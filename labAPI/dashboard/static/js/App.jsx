import React from 'react';
import ButtonAppBar from './TopBar.jsx'
import NetworkDisplay from './parameters/NetworkDisplay.jsx'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
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
      <SnackbarProvider maxSnack={3} preventDuplicate anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <ThemeProvider theme={theme}>
      <ButtonAppBar/>
      <Box m={4}>
      <Grid container spacing={2} justify='flex-start'>
        <Grid item>
          <NetworkDisplay snapshot={props.snapshot}/>
        </Grid>
      </Grid>
      </Box>
      </ThemeProvider>
    </SnackbarProvider>
    </div>
  )
}
