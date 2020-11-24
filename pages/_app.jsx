import React from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from '../style/theme'
import Layout from '../components/Layout'
import UserProvider from '../context/UserProvider'
import ContractProvider from '../context/ContractProvider'
import IpfsProvider from '../context/IpfsProvider'
// import UploadProvider from '../context/UploadProvider'

export default function Hirey(props) {
  const { Component, pageProps } = props

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <ContractProvider>
            <IpfsProvider>
              <Layout>
                <Container maxWidth='md' fixed>
                  <Component {...pageProps} />
                </Container>
              </Layout>
            </IpfsProvider>
          </ContractProvider>
        </UserProvider>
      </ThemeProvider>
    </>
  )
}

Hirey.propTypes = {
  Component: PropTypes.elementType.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  pageProps: PropTypes.object.isRequired,
}
