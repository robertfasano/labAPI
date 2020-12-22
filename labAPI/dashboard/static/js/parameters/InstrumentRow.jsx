import React from 'react';
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';
import ParameterRow from './ParameterRow.jsx'
import { MdDeviceHub } from 'react-icons/md'
import { connect } from 'react-redux'

function InstrumentRow(props) {
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
    <React.Fragment>
    <TableRow key={props.path} style={{background: props.backgroundColor}} onClick={(event)=>handleExpandClick(event)} hover>
      <TableCell><MdDeviceHub size={20} /></TableCell>
      <TableCell align="left" padding="default">
      <Typography style={{ flex: 1, fontWeight: 600}}> {props.name} </Typography>
      </TableCell>
      <TableCell>
      </TableCell>
      <TableCell align='right' padding='default'>
        <IconButton aria-label="show more" edge='start' size='small' onClick={(event)=>handleExpandClick(event)}>
          {props.expanded.includes(props.path)? (<ExpandLessIcon />): <ExpandMoreIcon />}
        </IconButton>
      </TableCell>
      <TableCell/>
    </TableRow>


    {Object.entries(props.subitems).map(([key, val], i) => (
      ((Object.keys(props.parameters).includes(props.path+'/'+key)))? (
      <ParameterRow key={props.path+'/'+key}
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
      <SubInstrumentRow key={props.path+'/'+key}
                     name={key}
                     expanded={props.expanded}
                     setExpanded={props.setExpanded}
                     subitems={val}
                     path={props.path+'/'+key}
                     />
                   ): null
    ))
    }
    </React.Fragment>
  );
}

function mapStateToProps(state, ownProps){
  return {parameters: state['parameters']}
}

const SubInstrumentRow = connect(mapStateToProps)(InstrumentRow)

export default connect(mapStateToProps)(InstrumentRow)
