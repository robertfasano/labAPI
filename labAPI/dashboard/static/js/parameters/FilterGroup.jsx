import React from 'react'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'
import ScienceIcon from '@mui/icons-material/Science'
import TuneIcon from '@mui/icons-material/Tune'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ListIcon from '@mui/icons-material/List'

export default function FilterGroup(props) {

  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const filterOpen = Boolean(anchorEl)

  return (
    <React.Fragment>
        <IconButton color={props.parameterFilter=='all'? 'primary': 'default'} onClick={()=>props.setParameterFilter('all')}>
          <VisibilityIcon/>
        </IconButton>
        <IconButton color={props.parameterFilter=='knob'? 'primary': 'default'} onClick={()=>props.setParameterFilter('knob')}>
          <TuneIcon/>
        </IconButton>
        <IconButton color={props.parameterFilter=='switch'? 'primary': 'default'} onClick={()=>props.setParameterFilter('switch')}>
          <ToggleOnIcon/>
        </IconButton>
        <IconButton color={props.parameterFilter=='selector'? 'primary': 'default'} onClick={()=>props.setParameterFilter('selector')}>
          <ListIcon/>
        </IconButton>
        <IconButton color={props.parameterFilter=='measurement'? 'primary': 'default'} onClick={()=>props.setParameterFilter('measurement')}>
          <ScienceIcon/>
        </IconButton>
        <IconButton color='default' disabled={true}>
          <SearchIcon/>
        </IconButton>
        <TextField value={props.filterText} onChange={(event) => props.setFilterText(event.target.value)} variant='standard' />
    </React.Fragment>
  )
}
