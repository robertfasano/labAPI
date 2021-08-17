import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import { GiRoundKnob } from 'react-icons/gi';
import { HiSelector } from 'react-icons/hi'
import { BsToggleOn } from 'react-icons/bs'
import { AiTwotoneExperiment } from 'react-icons/ai'
import { MdVisibility } from 'react-icons/md'


export default function FilterGroup(props) {

  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const filterOpen = Boolean(anchorEl)

  return (
    <React.Fragment>
        <IconButton color={props.parameterFilter=='all'? 'primary': 'default'} onClick={()=>props.setParameterFilter('all')}>
          <MdVisibility />
        </IconButton>
        <IconButton color={props.parameterFilter=='knob'? 'primary': 'default'} onClick={()=>props.setParameterFilter('knob')}>
          <GiRoundKnob />
        </IconButton>
        <IconButton color={props.parameterFilter=='switch'? 'primary': 'default'} onClick={()=>props.setParameterFilter('switch')}>
          <BsToggleOn />
        </IconButton>
        <IconButton color={props.parameterFilter=='selector'? 'primary': 'default'} onClick={()=>props.setParameterFilter('selector')}>
          <HiSelector />
        </IconButton>
        <IconButton color={props.parameterFilter=='measurement'? 'primary': 'default'} onClick={()=>props.setParameterFilter('measurement')}>
          <AiTwotoneExperiment />
        </IconButton>

        <IconButton color='default' disabled={true}>
          <SearchIcon/>
        </IconButton>
        <TextField value={props.filterText} onChange={(event) => props.setFilterText(event.target.value)} />
    </React.Fragment>
  )
}
