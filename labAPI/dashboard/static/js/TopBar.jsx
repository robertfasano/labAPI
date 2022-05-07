import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import MonitorButton from './MonitorButton.jsx'
export default function ButtonAppBar() {
  const useStyles = makeStyles(theme => ({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      '&:focus': {outline: 'none'},
    },
    button: {    '&:focus': {outline: 'none'},},
    appBarSpacer: theme.mixins.toolbar

  }));

  const classes = useStyles();

  return (
    <div>
      <AppBar position="fixed" className={classes.appBar} style={{background: 'linear-gradient(45deg, #67001a 30%, #004e67 90%)'}}>
        <Toolbar>
          <Typography variant="h6" style={{ flex: 1, fontFamily: 'Roboto', fontWeight: 500}}> LabAPI </Typography>
          <Typography style={{ flexGrow: 1 }}>  </Typography>
          <MonitorButton/>
        </Toolbar>
      </AppBar>
      <div className={classes.appBarSpacer} />
    </div>
  );
}
