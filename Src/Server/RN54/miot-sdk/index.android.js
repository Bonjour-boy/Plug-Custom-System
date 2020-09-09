/**
 * @export
 * @module miot
 * @description 米家ReactNative插件SDK
 *
 * @example
 *import {API_LEVEL, Package, Device, Service, Host, Resources, Bluetooth, DeviceProperties} from 'miot'
 *import {PackageEvent, DeviceEvent, BluetoothEvent} from 'miot'
 *import SDK from 'miot'
 *
 *import {ImageButton, InputDialog} from 'miot/ui'
 *import Res from 'miot/resources'
 *
 *import Bluetooth from 'miot/Bluetooth'
 *
 */
// import BluetoothFactory, { BluetoothEvent as BluetoothEventNames } from './Bluetooth';
// import ClassicBluetoothFactory, { ClassicBluetoothEvent as ClassicBluetoothEventNames } from './ClassicBluetooth';
// import RootDevice, { DeviceEvent as DeviceEventNames } from './Device';
// import HostInstance from './Host';
// import { AudioEvent as AudioEventNames } from './host/audio';
// import { FileEvent as FileEventNames } from './host/file';
// import PackageInstance, { Entrance as Entrances, PackageEvent as PackageEventNames } from './Package';
// import { RootDeviceProperties } from "./Properties";
// import ResourcesPack from './resources';
// import ServiceInstance from './Service';
// import { SceneType as SceneTypeNames } from './service/scene';
export const API_LEVEL = 10030
/**
 * 插件包基本配置
 * {@link module:miot/Package}
 * @export
 */
export const Package = null;
/**
 * 插件入口类型
 * {@link module:miot/Package~Entrance}
 * @export
 */
export const Entrance = null;
/**
 * 插件全局事件
 * {@link module:miot/Package~PackageEvent}
 * @export
 */
export const PackageEvent = null;
/**
 * 当前设备
 * {@link module:miot/Device}
 * @type {IDevice}
 * @export
 */
export const Device = null;
/**
 * 设备系统事件
 * {@link module:miot/Device~DeviceEvent}
 * @export
 */
export const DeviceEvent = null;
/**
 * 当前设备属性缓存
 * {@link module:miot/Properties}
 * @export
 * @type {IProperties}
 */
export const DeviceProperties = null;
/**
 * MIOT 提供的云服务
 * {@link module:miot/Service}
 * @export
 */
export const Service = null;
/**
 * 插件运行环境的本地服务
 * {@link module:miot/Host}
 * @export
 */
export const Host = null;
/**
 * 资源类
 * {@link module:miot/resources}
 * @export
 */
export const Resources = null;
/**
 * 蓝牙类
 * {@link module:miot/Bluetooth}
 * @export
 */
export const Bluetooth = null;
/**
 * 蓝牙事件
 * {@link module:miot/Bluetooth~BluetoothEvent}
 * @export
 */
export const BluetoothEvent = null;
/**
 * 蓝牙类
 * {@link module:miot/ClassicBluetooth}
 * @export
 */
export const ClassicBluetooth = null;
/**
 * 蓝牙事件
 * {@link module:miot/ClassicBluetooth~ClassicBluetoothEvent}
 * @export
 */
export const ClassicBluetoothEvent = null;
/**
 * 场景类型
 * {@link module:miot/service/scene~SceneType}
 * @export
 */
export const SceneType = null;
export const FileEvent = null;
export const AudioEvent = null;
// import * as Utils from './utils';
/**
 * @export
 */
export default {
    API_LEVEL, Package, PackageEvent, Entrance,
    Device, DeviceEvent, DeviceProperties,
    Service, Host, Resources,
    Bluetooth, BluetoothEvent, SceneType,
    FileEvent, AudioEvent, ClassicBluetooth, ClassicBluetoothEvent,
    // Utils
}