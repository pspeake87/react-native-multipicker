/**
 * Copyright (c) 2015-present Dave Vedder
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 *
 * @providesModule VPickerIOS
 *
 * This is a controlled component version of VDRPickerIOS
 *
 * WARNING: this is a proof of concept. Don't use it for reals yet. Also,
 * if your container has `flex` set on it, the picker moves around oddly.
 * I'm not sure if that's something I broke, or it happens in the default one 
 * as well. In addition, if you set a `width` on your picker, it seems to not 
 * behave properly. Set a background color on it when you set the width and
 * you will see what I mean.
 *
 */
'use strict';

var NativeMethodsMixin = require('NativeMethodsMixin');
var React = require('React');
var ReactChildren = require('ReactChildren');
var ReactIOSViewAttributes = require('ReactIOSViewAttributes');
var VDRPickerIOSConsts = require('NativeModules').UIManager.VDRPicker.Constants;
var StyleSheet = require('StyleSheet');
var View = require('View');

var createReactIOSNativeComponentClass =
  require('createReactIOSNativeComponentClass');
var merge = require('merge');

var PICKER = 'picker';

var VPickerIOS = React.createClass({

    propTypes: {
        onChange: React.PropTypes.func,
    },

    mixins: [NativeMethodsMixin],

    // converts child PickerComponent and their Item children into state
    // that can be sent to  VDRPicker native class.
    _stateFromProps: function (props) {
        var componentData = [];
        var selectedIndexes = [];
        var componentRefs = [];

        ReactChildren.forEach(props.children, function (child, index) {
            var items = []
            var selectedIndex = 0; // sane default
            var checkVal = child.props.selectedValue;
            React.Children.forEach(child.props.children, function (child, idx) {
                if (checkVal === child.props.value) {
                    selectedIndex = idx;
                }
                items.push({label: child.props.label, value: child.props.value}); 
            });
            componentData.push(items);
            selectedIndexes.push(selectedIndex);
        });
        return { componentData, selectedIndexes };
    },

    getInitialState: function() {
        return this._stateFromProps(this.props);
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState(this._stateFromProps(nextProps));
    },

    // calls our change handlers and updates native component
    _onChange: function (event) {
        var evt = event.nativeEvent;
        // call any change handler on the component itself
        if (this.props.onChange) {
            this.props.onChange(evt);
        }
        if (this.props.valueChange) {
            this.props.valueChange(evt);
        }
        // call any change handlers on the child component picker that changed
        // if it has one.
        ReactChildren.forEach(this.props.children, function (child, idx) {
            if (idx === evt.component && child.props.onChange) {
                child.props.onChange(evt);
            }
        });
        
        this.refs[PICKER].setNativeProps({
            selectedIndexes: this.state.selectedIndexes,
            componentData: this.state.componentData,
        });
    },

    render: function() {
        return (
            <View style={this.props.style}>
                <VDRPickerIOS
                    ref={PICKER}
                    style={styles.rkPickerIOS}
                    selectedIndexes={this.state.selectedIndexes}
                    componentData={this.state.componentData}
                    onChange={this._onChange}
                />
            </View>
        );
    },

});


// represents a "section" of a picker.
VPickerIOS.PickerComponent = React.createClass({
    propTypes: {
        items: React.PropTypes.array,
        selectedIndex: React.PropTypes.number,
        onChange: React.PropTypes.func,
    },
    render: function () {
        return null;
    },
});

// represents an item in a picker section
// the `value` is used for setting / getting selection
VPickerIOS.Item = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired, // string or integer basically
    label: React.PropTypes.string.isRequired, // for display
  },

  render: function() {
    // These items don't get rendered directly.
    return null;
  },
});

var styles = StyleSheet.create({
  rkPickerIOS: {
    height: VDRPickerIOSConsts.ComponentHeight,
  },
});

var exposedPickerAttributes = merge(ReactIOSViewAttributes.UIView, {
    componentData: true,
    selectedIndexes: true,
});

var VDRPickerIOS = createReactIOSNativeComponentClass({
  validAttributes: exposedPickerAttributes,
  uiViewClassName: 'VDRPicker',
});

module.exports = VPickerIOS;

