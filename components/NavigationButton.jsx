import styled from 'styled-components'
import Button from '@material-ui/core/Button'

const NavigationButton = styled(Button)`
  text-transform: none;
  vertical-align: text-bottom;
  font-size: 1rem;
  &:hover {
    background-color: transparent;
    color: '#6d91c9';
  }
`

export default NavigationButton
