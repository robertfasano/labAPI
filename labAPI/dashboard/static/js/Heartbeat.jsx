import React from 'react'
import Box from '@mui/material/Box'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HeartBrokenIcon from '@mui/icons-material/HeartBroken'
import axios from 'axios'
import { useSnackbar } from 'notistack'

export default function Heartbeat (props) {
    const [connected, setConnected] = React.useState(false)
    const [heartbeat, setHeartbeat] = React.useState(false)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const connectedRef = React.useRef()
    connectedRef.current = connected
  
    const heartbeatRef = React.useRef()
    heartbeatRef.current = heartbeat

    function ping() {
      axios.get('/ping')
      .then(
        (response) => {
          setHeartbeat(!heartbeatRef.current)
          if (!connectedRef.current) {
            closeSnackbar()
            enqueueSnackbar('Connected to LabAPI server.', {variant: 'success'})
          }
          setConnected(true)
        }
      )
        .catch(
          error => {
            enqueueSnackbar('Disconnected from LabAPI server.', {variant: 'error', autoHideDuration: null})
            setConnected(false)
          }
        )
    }
  
    React.useEffect(() => {
      const interval = setInterval(() => {
        ping()
      }, 700);
      return () => clearInterval(interval);
    }, []);


  if (!connected) {
      return (
        <Box mr={1} mt={0.5}>
            <HeartBrokenIcon/>
        </Box>
      )
  }
  return (
      <Box mr={1} mt={0.5}>
        {heartbeat ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
      </Box>
  )
}
