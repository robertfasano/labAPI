import React from 'react';
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Plot from 'react-plotly.js';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { post } from '../utilities.js'
import { connect } from 'react-redux'
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Skeleton from '@material-ui/lab/Skeleton';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import {sortableHandle} from 'react-sortable-hoc';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import DragHandleIcon from '@material-ui/icons/DragHandle';

const DragHandle = sortableHandle(() => <IconButton><DragHandleIcon/></IconButton>);

function PlotPanel(props) {
  const [maxPoints, setMaxPoints] = React.useState(25)
  const loading = props.data.x.length == 0

  const [slidingWindow, setSlidingWindow] = React.useState(true)

  function remove() {
    props.dispatch({type: 'plotting/remove', path: props.path})
  }

  let x = props.data.x
  let y = props.data.y
  if (slidingWindow) {
    x = x.slice(Math.max(x.length - maxPoints, 1))
    y = y.slice(Math.max(y.length - maxPoints, 1))
  }

  const width = 900
  const height = 275
  const [layout, setLayout] = React.useState({width: width, height:height-75, margin: {t: 40, b:40}, showlegend: false})

  return (
    <Paper elevation={3}>
    <Box width={width} height={height}>
      <Toolbar>
        <DragHandle/>
        <Typography variant="h6" style={{ flex: 1, fontFamily: 'Roboto', fontWeight: 500}}> {props.path} </Typography>
        <Checkbox checked={slidingWindow} onChange={()=>setSlidingWindow(!slidingWindow)}/>
        <Box width={90}>
          <TextField inputProps={{style: {padding: 5}}} variant='outlined' label="Max points" value={maxPoints} onChange={(event)=>setMaxPoints(event.target.value)} disabled={!slidingWindow} />
        </Box>
        <IconButton onClick={remove}>
          <CloseIcon />
        </IconButton>

      </Toolbar>
      <Grid container alignItems="center" justify="center" direction='row'>
          {!loading? (
            <Plot
              data={[
                {
                  x: x,
                  y: y,
                  type: 'line',
                  marker: {color: '#004e67'},
                },
              ]}
              layout={layout}
            />
        ) :
        <CircularProgress />

        }
    </Grid>
    </Box>
    </Paper>
  )
}

function mapStateToProps(state, ownProps){
  return {data: state['plotting'].data[ownProps.path]}
}
export default connect(mapStateToProps)(PlotPanel)
