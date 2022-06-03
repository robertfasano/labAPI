import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import { get } from './utilities.js'
import MonitorButton from './MonitorButton.jsx'
import Heartbeat from './Heartbeat.jsx'
import RefreshIcon from '@mui/icons-material/Refresh'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

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
          <Box mr={1} mt={0.5}>
            <IconButton onClick={() => get('/sync')} style={{color: 'white'}}>
              <RefreshIcon/>
            </IconButton>
          </Box>
          <MonitorButton/>
          <Heartbeat/>
        </Toolbar>
      </AppBar>
      <div className={classes.appBarSpacer} />
    </div>
  );
}
