// Minimal React Native mock for unit tests
export const Platform = { OS: 'ios', select: (obj: any) => obj.ios };
export const Alert = { alert: jest.fn() };
export const StyleSheet = { create: (styles: any) => styles };
export const View = 'View';
export const Text = 'Text';
export const TouchableOpacity = 'TouchableOpacity';
export const ScrollView = 'ScrollView';
export const ActivityIndicator = 'ActivityIndicator';
export const Modal = 'Modal';
export const KeyboardAvoidingView = 'KeyboardAvoidingView';
