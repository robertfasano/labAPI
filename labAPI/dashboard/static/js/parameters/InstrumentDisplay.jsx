import React from 'react';
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from '@material-ui/core/Grid';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';
import Paper from "@material-ui/core/Paper";
import ParameterDisplay from './ParameterDisplay.jsx'
import { MdDeviceHub } from 'react-icons/md'
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    // transition: "transform 0.15s ease-in-out",
    // "&:hover": { transform: "scale3d(1.01, 1.01, 1)"},
  },
});

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

  const classes = useStyles()

  return (
    <Box mb={2} mx={2} width={1} key={props.path}>
    <Paper elevation={3} className={classes.root}>
    <Grid container spacing={2} >
      <Grid container item xs={12} onClick={(event)=>handleExpandClick(event)}>
        <Grid container item xs={2}>
          <Box ml={2} className="drag-handle">
            <MdDeviceHub size={20} />
          </Box>
        </Grid>

        <Grid container item xs={6} justify="flex-start">
          <Typography style={{ flex: 1, fontWeight: 600}}> {props.name} </Typography>
        </Grid>

        <Grid container item xs={4} justify="flex-end">
          <IconButton aria-label="show more" edge='start' size='small' disabled>
            {props.expanded.includes(props.path)? (<ExpandLessIcon />): <ExpandMoreIcon />}
          </IconButton>
        </Grid>
      </Grid>

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


    {Object.entries(props.subitems).map(([key, val], i) => (
      (props.expanded.includes(props.path) & !(Object.keys(props.parameters).includes(props.path+'/'+key)))? (
      <Grid container item xs={12} key={props.path+'/'+key}>
      <SubInstrumentDisplay key={props.path+'/'+key}
                     name={key}
                     expanded={props.expanded}
                     setExpanded={props.setExpanded}
                     subitems={val}
                     path={props.path+'/'+key}
                     />
      </Grid>

                   ): null
    ))
    }
    </Grid>
    </Paper>
    </Box>
  );
}

function mapStateToProps(state, ownProps){
  return {parameters: state['parameters']}
}

const SubInstrumentDisplay = connect(mapStateToProps)(InstrumentDisplay)

export default connect(mapStateToProps)(InstrumentDisplay)
