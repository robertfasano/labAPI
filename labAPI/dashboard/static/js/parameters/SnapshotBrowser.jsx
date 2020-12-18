import React from 'react';
import { connect } from 'react-redux'
import IconButton from '@material-ui/core/IconButton';
import HistoryOutlinedIcon from '@material-ui/icons/HistoryOutlined';
import Popover from '@material-ui/core/Popover';
import { get, post } from '../utilities.js'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";

function SnapshotBrowser(props) {

  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClose = () => setAnchorEl(null)
  const open = Boolean(anchorEl)

  const [snapshots, setSnapshots] = React.useState({})
  const [currentSnapshot, setCurrentSnapshot] = React.useState('')

  function loadSnapshots(event) {
    setAnchorEl(event.currentTarget)
    get("/snapshots", (obj) => {
      setSnapshots(obj)
      setCurrentSnapshot(Object.keys(obj)[0])
    }
  )
  }

  return (
    <React.Fragment>
      <IconButton onClick={loadSnapshots}>
        <HistoryOutlinedIcon />
      </IconButton>
      <Popover open={open}
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
      <Select value={currentSnapshot} onChange={(event)=>setCurrentSnapshot(event.target.value)}>
        {Object.entries(snapshots).map(([key, val], i) => (
          <MenuItem key={key} value={key}>{key}</MenuItem>
        ))
        }
      </Select>
      <Table>
      {Object.keys(snapshots).includes(currentSnapshot)? (Object.entries(snapshots[currentSnapshot]).map(([key, val], i) => (
        <TableRow>
          <TableCell>{key}</TableCell>
          <TableCell>{String(val)}</TableCell>
        </TableRow>
      ))): null
      }
      </Table>
      </Popover>
    </React.Fragment>
  )
}

export default connect()(SnapshotBrowser)
