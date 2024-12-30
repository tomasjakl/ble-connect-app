import {useEffect, useState} from 'react';
import {PermissionsAndroid} from 'react-native';

const requiredPermissons = [
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
];

export const usePermissions = () => {
  const [isGranted, setIsGranted] = useState<boolean>();
  const [isDenied, setIsDenied] = useState<boolean>();

  const request = async () => {
    const result = await PermissionsAndroid.requestMultiple(requiredPermissons);

    setIsGranted(
      requiredPermissons.every(
        permission => result[permission] === PermissionsAndroid.RESULTS.GRANTED,
      ),
    );

    setIsDenied(
      requiredPermissons.some(
        permission =>
          result[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      ),
    );
  };

  useEffect(() => {
    request();
  }, []);

  return {request, isGranted, isDenied};
};
