import React from 'react'
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Grid from '@mui/material/Grid'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import IconButton from '@mui/material/IconButton'
import Paper from "@mui/material/Paper"
import ParameterDisplay from './ParameterDisplay.jsx'
import DeviceHubIcon from '@mui/icons-material/DeviceHub'
import { connect } from 'react-redux'

function InstrumentDisplay(props) {
  const handleExpandClick = (event) => {
    event.stopPropagation()
    if (props.expanded.includes(props.path))
    {
      props.setExpanded(props.expanded.filter(name => name != props.path))
    }
    else {
      props.setExpanded(props.expanded.concat(props.path));
    }
  }

  return (
    <Box key={props.path} sx={{ mb: '12px', mx: '2px', width: 1}}>
    <Paper elevation={3}>
    {/* <Grid container spacing='24px' > */}

      <Box py='8px'>
        <Grid container item xs={12} onClick={(event)=>handleExpandClick(event)}>
          <Grid container item xs={2}>
            <Box className="drag-handle" sx={{ ml: 2}}>
              <DeviceHubIcon size={20} />
            </Box>
          </Grid>

          <Grid container item xs={6} justifyContent="flex-start">
            <Typography style={{ flex: 1, fontWeight: 600}}> {props.name} </Typography>
          </Grid>

          <Grid container item xs={4} justifyContent="flex-end">
            <IconButton aria-label="show more" edge='start' size='small' disabled>
              {props.expanded.includes(props.path)? (<ExpandLessIcon />): <ExpandMoreIcon />}
            </IconButton>
          </Grid>
        </Grid>
      </Box>

    <Box px='16px'>
      {Object.entries(props.subitems).map(([key, val], i) => (
        ((Object.keys(props.parameters).includes(props.path+'/'+key)))? (
        <ParameterDisplay key={props.path+'/'+key}
                      name={key}
                      path={props.path+'/'+key}
                      isVisible={props.expanded.includes(props.path)}
        />
                    ): null
                  )
                )

      }
    </Box>

    <Box px='12px'>
      {Object.entries(props.subitems).map(([key, val], i) => (
        (props.expanded.includes(props.path) & !(Object.keys(props.parameters).includes(props.path+'/'+key)))? (
        <Grid container item xs={12} key={props.path+'/'+key}>
        <SubInstrumentDisplay key={props.path+'/'+key}
                      name={key}
                      expanded={props.expanded}
                      setExpanded={props.setExpanded}
                      subitems={val}
                      path={props.path+'/'+key}
                      topLevel={false}
                      />
        </Grid>

                    ): null
      ))
      }
    </Box>
    {/* </Grid> */}
    </Paper>
    </Box>
  );
}

function mapStateToProps(state, ownProps){
  return {parameters: state['parameters']}
}

const SubInstrumentDisplay = connect(mapStateToProps)(InstrumentDisplay)

export default connect(mapStateToProps)(InstrumentDisplay)
