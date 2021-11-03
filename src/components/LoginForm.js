import React, { Component } from 'react'
import { Platform, View } from 'react-native'
import { connect } from 'react-redux'
import { Stack, FormControl, Input, Button, Text, Box } from 'native-base'
import { Formik } from 'formik'
import _ from 'lodash'
import { withTranslation } from 'react-i18next'
import { AccessToken, LoginManager, Settings } from 'react-native-fbsdk-next'
import Config from 'react-native-config'

import FacebookButton from './FacebookButton'
import { loginWithFacebook } from '../redux/App/actions'

class LoginForm extends Component {

  constructor(props) {
    super(props)

    this._passwordInput = null
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      Settings.setAppID(Config.FACEBOOK_APP_ID)
    }
  }

  _validate(values) {

    let errors = {}

    if (_.isEmpty(values.email)) {
      errors.email = true
    }

    if (_.isEmpty(values.password)) {
      errors.password = true
    }

    return errors
  }

  _onSubmit(values) {
    const { email, password } = values
    this.props.onSubmit(email, password)
  }

  render() {

    const initialValues = {
      email: '',
      password: '',
    }

    return (
      <Formik
        initialValues={ initialValues }
        validate={ this._validate.bind(this) }
        onSubmit={ this._onSubmit.bind(this) }
        validateOnBlur={ false }
        validateOnChange={ false }>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <Stack>
          <FormControl error={ (touched.email && errors.email) || this.props.hasErrors }>
            <FormControl.Label>{this.props.t('USERNAME')}</FormControl.Label>
            <Input
              testID="loginUsername"
              autoCorrect={ false }
              autoCapitalize="none"
              style={{ height: 40 }}
              returnKeyType="next"
              onChangeText={ handleChange('email') }
              onBlur={ handleBlur('email') }
              onSubmitEditing={ () => this._passwordInput.focus() }
            />
          </FormControl>
          <FormControl error={ (touched.password && errors.password) || this.props.hasErrors }>
            <FormControl.Label>{this.props.t('PASSWORD')}</FormControl.Label>
            <Input
              testID="loginPassword"
              ref={ component => { this._passwordInput = component } }
              autoCorrect={ false }
              autoCapitalize="none"
              secureTextEntry={ true }
              style={{ height: 40 }}
              returnKeyType="done"
              onChangeText={ handleChange('password') }
              onBlur={ handleBlur('password') }
              onSubmitEditing={ handleSubmit }/>
          </FormControl>
          <Button size="sm" variant="link" onPress={ () => this.props.onForgotPassword() }>
            {this.props.t('FORGOT_PASSWORD')}
          </Button>
          <View style={{ marginTop: 20 }}>
            <Button block onPress={ handleSubmit } testID="loginSubmit">
              { this.props.t('SUBMIT') }
            </Button>
          </View>
          { this.props.withFacebook ? (
            <Box mt="2">
              <FacebookButton
                onPress={ () => {
                  LoginManager.logInWithPermissions(['public_profile', 'email']).then(
                    (result) => {
                      if (result.isCancelled) {
                        console.log('Login cancelled')
                      } else {
                        // Cross-platform way of retrieving email
                        // https://github.com/thebergamo/react-native-fbsdk-next#get-profile-information
                        // https://github.com/thebergamo/react-native-fbsdk-next/issues/78#issuecomment-888085735
                        AccessToken.getCurrentAccessToken().then(
                          (data) => this.props.loginWithFacebook(data.accessToken.toString())
                        )
                      }
                    },
                    (error) => {
                      console.log(error);
                    }
                  )
                }} />
            </Box>
          ) : null }
        </Stack>
        )}
      </Formik>
    )
  }
}

function mapStateToProps(state) {

  return {
    hasErrors: !!state.app.lastAuthenticationError,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loginWithFacebook: (accessToken) => dispatch(loginWithFacebook(accessToken)),
  }
}

export { LoginForm }
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LoginForm))
