/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.bridge

/**
 * Like [AssertionError] but extends RuntimeException so that it may be caught by a
 * [JSExceptionHandler]. See that class for more details. Used in conjunction with [SoftAssertions].
 */
public class AssertionException(message: String) : RuntimeException(message)
