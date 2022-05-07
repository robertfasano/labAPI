import React from 'react'
import Box from '@material-ui/core/Box'
import Popover from "@material-ui/core/Popover"
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import ScienceIcon from '@mui/icons-material/Science'
import TuneIcon from '@mui/icons-material/Tune'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ListIcon from '@mui/icons-material/List'

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
