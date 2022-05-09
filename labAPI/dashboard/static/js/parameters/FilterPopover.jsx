import React from 'react'
import Box from '@mui/material/Box'
import Popover from "@mui/material/Popover"
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import ScienceIcon from '@mui/icons-material/Science'
import TuneIcon from '@mui/icons-material/Tune'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ListIcon from '@mui/icons-material/List'
import Autocomplete from '@mui/material/Autocomplete'
import { connect } from 'react-redux'

function FilterPopover(props) {

  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const filterOpen = Boolean(anchorEl)
  const [inputValue, setInputValue] = React.useState('')
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
            <Autocomplete options={props.parameters}
              value={props.filterText}
              renderInput={(params) => <TextField {...params} label={props.label} variant='standard' />}
              onChange = {(event, newValue) => props.setFilterText(newValue || '')}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue)
              }}
              style={{ width: '250px' }}
            />


          </Box>
      </Popover>
    </React.Fragment>
  )
}

// export default FilterPopover
function mapStateToProps(state, ownProps){
  return {parameters: Object.keys(state['parameters'])}
}
export default connect(mapStateToProps)(FilterPopover)
