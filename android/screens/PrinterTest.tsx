import {useEffect, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  ActivityIndicator,
} from 'react-native';

import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';

interface DeviceObj {
  name: string;
  address: string;
}

const initialConnectStatus = {
  loading: false,
  boundAddress: '',
};

const PrinterTest = () => {
  const [paired, setPaired] = useState<Array<DeviceObj>>([]);
  const [unpaired, setUnpaired] = useState<Array<DeviceObj>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [bluetoothEnabled, setbluetoothEnabled] = useState<boolean>(false);

  const [connectStatus, setConnectStatus] = useState(initialConnectStatus);

  const checkBluetoothEnabled = () => {
    BluetoothManager.isBluetoothEnabled()
      .then(enabled => {
        console.log('enabled?', enabled); // enabled ==> true /false
        setbluetoothEnabled(enabled);
      })
      .catch(err => console.log('error->', err));
  };

  const connect = (address: string, index: number) => {
    if (address == connectStatus.boundAddress) {
      Alert.alert('already connected');
      return;
    }
    setCurrentIndex(index);
    setConnectStatus({...connectStatus, loading: true});
    console.log('address->', address);
    BluetoothManager.connect(address) // the device address scanned.
      .then(s => {
        setConnectStatus({
          loading: false,
          boundAddress: address,
        });
      })
      .catch((e: any) => {
        setConnectStatus({
          loading: false,
          boundAddress: '',
        });
        Alert.alert(e);
      });
  };

  const disableBluetooth = () => {
    BluetoothManager.disableBluetooth()
      .then(data => {
        console.log('abled->', data);
        setbluetoothEnabled(false);
        setConnectStatus({loading: false, boundAddress: ''});
        setPaired([]);
        setUnpaired([]);
      })
      .catch(err => {
        Alert.alert(err);
      });
  };

  const enableBluetooth = () => {
    BluetoothManager.enableBluetooth()
      .then(r => {
        var paired = [];
        if (r && r.length > 0) {
          for (var i = 0; i < r.length; i++) {
            try {
              paired.push(JSON.parse(r[i])); // NEED TO PARSE THE DEVICE INFORMATION
            } catch (e) {
              //ignore
            }
          }
        }
        const pairedStrObj = JSON.stringify(paired);
        console.log('paired->', pairedStrObj);
        setbluetoothEnabled(true);
        setPaired(paired);
      })
      .catch(err => {
        Alert.alert('enable bluetooth error->', err);
      });
  };

  const toggleSwitch = () => {
    if (bluetoothEnabled) {
      disableBluetooth();
    } else {
      enableBluetooth();
    }
  };
  const scanDevice = () => {
    BluetoothManager.scanDevices()
      .then(s => {
        var ss = JSON.parse(s); //JSON string
        console.log('s->', s);
      })
      .catch(er => {
        setConnectStatus({
          loading: false,
          boundAddress: '',
        });
        Alert.alert('error' + JSON.stringify(er));
      });
  };

  const print = async () => {
    await BluetoothEscposPrinter.printerInit();
    await BluetoothEscposPrinter.setBlob(0);
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    );
    //await BluetoothEscposPrinter.printText('Print OKE !!!\r\n\r\n', {});
    await BluetoothEscposPrinter.printText('iububuibuib\n\r', {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 3,
      heigthtimes: 3,
      fonttype: 1,
    });
    await BluetoothEscposPrinter.printText('hhhhhhb\n\r', {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 3,
      heigthtimes: 3,
      fonttype: 1,
    });
    await BluetoothEscposPrinter.printQRCode('red', 200, 1);
  };

  useEffect(() => {
    if (bluetoothEnabled) {
      enableBluetooth();
    }
  }, [bluetoothEnabled]);

  useEffect(() => {
    checkBluetoothEnabled();
  }, []);

  return (
    <ScrollView>
      <View style={{alignItems: 'center', marginBottom: 20}}>
        <Text style={{fontSize: 20}}>Limm Printer Test</Text>
      </View>
      {/*   <TouchableOpacity
        onPress={checkBluetoothEnabled}
        style={{backgroundColor: 'blue', padding: 10}}>
        <Text>CHeck bluetooth</Text>
      </TouchableOpacity>
 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
        }}>
        <Text>Toggle Bluetooth</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={bluetoothEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={bluetoothEnabled}
        />
      </View>

      {/*  <TouchableOpacity
        onPress={enableBluetooth}
        style={{backgroundColor: 'blue', padding: 10}}>
        <Text>enable Bluetooth</Text>
      </TouchableOpacity> */}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          marginVertical: 10,
        }}>
        <Text>Connected to</Text>
        <Text>{connectStatus.boundAddress || 'no device'}</Text>
      </View>

      <TouchableOpacity
        disabled={connectStatus.loading || connectStatus.boundAddress == ''}
        onPress={print}
        style={{
          backgroundColor: 'blue',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
        }}>
        <Text style={{color: 'white'}}>Test Print</Text>
      </TouchableOpacity>

      <View>
        <Text style={{fontSize: 20, textAlign: 'center'}}>Paired</Text>
        {paired.map((device: DeviceObj, index: number) => {
          return (
            <View
              style={{
                paddingHorizontal: 10,
                flexDirection: 'row',
                marginVertical: 10,
                justifyContent: 'space-between',
              }}
              key={device.address}>
              <View>
                <Text>{device.name}</Text>
                <Text>{device.address}</Text>
              </View>
              <TouchableOpacity
                onPress={() => connect(device.address, index)}
                style={[
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 100,
                    padding: 10,
                  },
                  connectStatus.boundAddress == device.address
                    ? {backgroundColor: 'green'}
                    : {backgroundColor: 'blue'},
                ]}>
                {connectStatus.loading && currentIndex == index ? (
                  <ActivityIndicator size={20} color={'white'} />
                ) : (
                  <Text style={{color: 'white'}}>
                    {device.address == connectStatus.boundAddress
                      ? 'Connected'
                      : 'Connect'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <View>
        <Text style={{fontSize: 20, textAlign: 'center'}}>Scanned</Text>
        {paired.map((device: DeviceObj) => {
          return (
            <View
              style={{
                paddingHorizontal: 10,
                flexDirection: 'row',
                marginVertical: 10,
                justifyContent: 'space-between',
              }}
              key={device.address}>
              <View>
                <Text>{device.name}</Text>
                <Text>{device.address}</Text>
              </View>
              <TouchableOpacity
                onPress={() => connect(device.address)}
                style={{
                  backgroundColor: 'blue',
                  justifyContent: 'center',
                  padding: 10,
                }}>
                <Text style={{color: 'white'}}>Connect</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <TouchableOpacity
        disabled={connectStatus.loading || !bluetoothEnabled}
        onPress={scanDevice}
        style={{
          backgroundColor: 'blue',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
        }}>
        <Text style={{color: 'white'}}>Scan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: 'light-gray',
  },
});

export default PrinterTest;
