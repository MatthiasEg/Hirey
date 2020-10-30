import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#00111d',
    },
    secondary: {
      main: '#018ed7',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#adadad',
    },
  },
})

export default theme
