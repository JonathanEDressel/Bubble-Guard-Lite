import ExpoModulesCore
import UIKit

public class LockStateModule: Module {
  private var lockObserver: NSObjectProtocol?
  private var unlockObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("LockState")

    Events("onLockStateChange")

    OnCreate {
      self.lockObserver = NotificationCenter.default.addObserver(
        forName: UIApplication.protectedDataWillBecomeUnavailableNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.sendEvent("onLockStateChange", ["locked": true])
      }

      self.unlockObserver = NotificationCenter.default.addObserver(
        forName: UIApplication.protectedDataDidBecomeAvailableNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.sendEvent("onLockStateChange", ["locked": false])
      }
    }

    OnDestroy {
      if let obs = self.lockObserver {
        NotificationCenter.default.removeObserver(obs)
      }
      if let obs = self.unlockObserver {
        NotificationCenter.default.removeObserver(obs)
      }
    }

    // Synchronous check: false means the phone is currently locked.
    Function("isProtectedDataAvailable") { () -> Bool in
      if Thread.isMainThread {
        return UIApplication.shared.isProtectedDataAvailable
      }
      var result = true
      DispatchQueue.main.sync {
        result = UIApplication.shared.isProtectedDataAvailable
      }
      return result
    }
  }
}
