import React from 'react';
import Box from '@material-ui/core/Box';
import Popover from "@material-ui/core/Popover";
import IconButton from '@material-ui/core/IconButton';
import { get, post } from '../utilities.js'
import TextField from '@material-ui/core/TextField';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined';
import { Input, InputLabel } from "@material-ui/core";
import { GiRoundKnob } from 'react-icons/gi';
import { HiSelector } from 'react-icons/hi'
import { BsToggleOn } from 'react-icons/bs'
import { AiTwotoneExperiment } from 'react-icons/ai'
import { MdVisibility } from 'react-icons/md'

function FilterPopover(props) {

  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const filterOpen = Boolean(anchorEl)

  return (
    <React.Fragment>
    <IconButton color={filterOpen? 'primary': 'default'} onClick={handleClick}>
      <FilterListIcon />
    </IconButton>
      <Popover open={filterOpen}
               anchorEl={anchorEl}
               onClose={handleClose}
               anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
        >
          <Box display='flex'>
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

          </Box>

          <Box display='flex'>
            <IconButton color='default' disabled={true}>
              <SearchIcon/>
            </IconButton>
            <TextField value={props.filterText} onChange={(event) => props.setFilterText(event.target.value)} />
          </Box>
      </Popover>
    </React.Fragment>
  )
}

export default FilterPopover
