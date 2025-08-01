/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.bridge

import com.facebook.react.common.annotations.internal.LegacyArchitecture
import com.facebook.react.common.annotations.internal.LegacyArchitectureLogLevel
import com.facebook.react.common.annotations.internal.LegacyArchitectureLogger

/** Implementation of javascript callback function that uses Bridge to schedule method execution. */
@LegacyArchitecture(logLevel = LegacyArchitectureLogLevel.ERROR)
internal class CallbackImpl(private val jsInstance: JSInstance, private val callbackId: Int) :
    Callback {
  private var invoked = false

  override fun invoke(vararg args: Any?) {
    if (invoked) {
      throw RuntimeException(
          "Illegal callback invocation from native module. This callback type only permits a single invocation from native code.")
    }
    @Suppress("UNCHECKED_CAST")
    jsInstance.invokeCallback(callbackId, Arguments.fromJavaArgs(args as Array<Any?>))
    invoked = true
  }

  private companion object {
    init {
      LegacyArchitectureLogger.assertLegacyArchitecture(
          "CallbackImpl", LegacyArchitectureLogLevel.ERROR)
    }
  }
}
