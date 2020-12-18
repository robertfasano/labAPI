import { combineReducers } from 'redux'
import {setIn} from 'immutable'
import produce from 'immer'
import arrayMove from 'array-move';


function alert(state={}, action) {
  switch(action.type) {
    default : return state;
    case 'alert/show':
      return {'open': true, 'severity': action.severity, 'text': action.text}
    case 'alert/hide':
      return produce(state, draft => {
        draft['open'] = false
      })
    }
}

function instruments(state={}, action) {
  switch(action.type) {
    default : return state;
    }
}

function plotting(state={parameters: [], data: {}}, action) {
  switch(action.type) {
    default : return state;

    case 'plotting/add':
      return produce(state, draft => {
        draft.data[action.path] = {x: [], y: []}
        draft.parameters = [...new Set(draft.parameters.concat(action.path))]
      })

    case 'plotting/moveToIndex':
      return produce(state, draft => {
        const idx = draft.parameters.indexOf(action.path)
        draft.parameters = arrayMove(draft.parameters, idx, action.index)
      })

    case 'plotting/remove':
      return produce(state, draft => {
        delete draft.data[action.path]
        draft.parameters = draft.parameters.filter(value => action.path != value)
      })

    case 'plotting/setData':
      return produce(state, draft => {
        draft.data[action.path] = action.data
      })

    case 'plotting/toggle':
      return produce(state, draft => {
        if (draft.parameters.includes(action.path)) {
          delete draft.data[action.path]
          draft.parameters = draft.parameters.filter(value => action.path != value)
        }
        else {
          draft.data[action.path] = {x: [], y: []}
          draft.parameters = [...new Set(draft.parameters.concat(action.path))]
        }
      })
  }
}

function parameters(state={}, action) {
  switch(action.type) {
    default : return state;

    case 'parameters/update':
      return produce(state, draft => {
        draft[action.path]['value'] = action.value
      })
    }
}

const reducer = combineReducers({plotting, alert,  instruments, parameters})

export default reducer
