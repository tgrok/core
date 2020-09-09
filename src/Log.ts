let debug = false

export default class Log {
  static set debug(newValue: boolean) {
    debug = newValue
  }

  static info(msg: any, show?: boolean) {
    if (!debug && !show) {
      return
    }
    /* tslint:disable */
    console.log(msg)
    /* tslint:enable */
  }

  static error(msg: any) {
    /* tslint:disable */
    console.log(msg)
    /* tslint:enable */
  }
}
