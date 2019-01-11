import React, { Component } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import _ from 'lodash'
import { Button, Icon, Text } from 'native-base'

import Settings from '../Settings'
import API from '../API'
import AppUser from '../AppUser'
import { bootstrap } from '../redux/App/actions'

class Loading extends Component {

  constructor(props) {
    super(props)
    this.state = {
      error: false
    }
  }

  async load() {

    this.setState({ error: false })

    const baseURL = await Settings.loadServer()

    if (baseURL) {

      try {

        const user = await AppUser.load()
        const settings = await Settings.synchronize(baseURL)

        this.props.bootstrap(baseURL, user)

      } catch (e) {
        this.setState({ error: true })
      }

    } else {
      this.props.navigation.navigate('ConfigureServer')
    }
  }

  componentDidMount() {
    this.load()
  }

  renderError() {
    return (
      <View style={ styles.error }>
        <Icon name="warning" />
        <Text style={ styles.errorText }>
          { this.props.t('NET_FAILED') }
        </Text>
        <Button block onPress={ () => this.load() }>
          <Text>{ this.props.t('RETRY') }</Text>
        </Button>
      </View>
    )
  }

  render() {
    return (
      <View style={ styles.loader }>
        { !this.state.error && <ActivityIndicator animating={ true } size="large" /> }
        { this.state.error && this.renderError() }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    marginBottom: 10,
  }
})

function mapStateToProps(state) {

  return {}
}

function mapDispatchToProps(dispatch) {

  return {
    bootstrap: (baseURL, user) => dispatch(bootstrap(baseURL, user)),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(translate()(Loading))
