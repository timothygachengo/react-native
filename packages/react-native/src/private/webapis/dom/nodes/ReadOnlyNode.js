/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint unsafe-getters-setters:off

import type NodeList from '../oldstylecollections/NodeList';
import type {InstanceHandle} from './internals/NodeInternals';
import type ReactNativeDocument from './ReactNativeDocument';
import type ReadOnlyElement from './ReadOnlyElement';

import {setPlatformObject} from '../../webidl/PlatformObjects';
import {createNodeList} from '../oldstylecollections/NodeList';
import {
  getNativeNodeReference,
  getOwnerDocument,
  getPublicInstanceFromInstanceHandle,
  setInstanceHandle,
  setOwnerDocument,
} from './internals/NodeInternals';
import NativeDOM from './specs/NativeDOM';

export default class ReadOnlyNode {
  constructor(
    instanceHandle: InstanceHandle,
    // This will be null for the document node itself.
    ownerDocument: ReactNativeDocument | null,
  ) {
    // This constructor is inlined in `ReactNativeElement` so if you modify
    // this make sure that their implementation stays in sync.
    setOwnerDocument(this, ownerDocument);
    setInstanceHandle(this, instanceHandle);
  }

  get childNodes(): NodeList<ReadOnlyNode> {
    const childNodes = getChildNodes(this);
    return createNodeList(childNodes);
  }

  get firstChild(): ReadOnlyNode | null {
    const childNodes = getChildNodes(this);

    if (childNodes.length === 0) {
      return null;
    }

    return childNodes[0];
  }

  get isConnected(): boolean {
    const shadowNode = getNativeNodeReference(this);

    if (shadowNode == null) {
      return false;
    }

    return NativeDOM.isConnected(shadowNode);
  }

  get lastChild(): ReadOnlyNode | null {
    const childNodes = getChildNodes(this);

    if (childNodes.length === 0) {
      return null;
    }

    return childNodes[childNodes.length - 1];
  }

  get nextSibling(): ReadOnlyNode | null {
    const [siblings, position] = getNodeSiblingsAndPosition(this);

    if (position === siblings.length - 1) {
      // this node is the last child of its parent, so there is no next sibling.
      return null;
    }

    return siblings[position + 1];
  }

  /**
   * @abstract
   */
  get nodeName(): string {
    throw new TypeError(
      '`nodeName` is abstract and must be implemented in a subclass of `ReadOnlyNode`',
    );
  }

  /**
   * @abstract
   */
  get nodeType(): number {
    throw new TypeError(
      '`nodeType` is abstract and must be implemented in a subclass of `ReadOnlyNode`',
    );
  }

  /**
   * @abstract
   */
  get nodeValue(): string | null {
    throw new TypeError(
      '`nodeValue` is abstract and must be implemented in a subclass of `ReadOnlyNode`',
    );
  }

  get ownerDocument(): ReactNativeDocument | null {
    return getOwnerDocument(this);
  }

  get parentElement(): ReadOnlyElement | null {
    const parentNode = this.parentNode;

    if (parentNode instanceof getReadOnlyElementClass()) {
      return parentNode;
    }

    return null;
  }

  get parentNode(): ReadOnlyNode | null {
    const shadowNode = getNativeNodeReference(this);

    if (shadowNode == null) {
      return null;
    }

    const parentInstanceHandle = NativeDOM.getParentNode(shadowNode);

    if (parentInstanceHandle == null) {
      return null;
    }

    return getPublicInstanceFromInstanceHandle(parentInstanceHandle) ?? null;
  }

  get previousSibling(): ReadOnlyNode | null {
    const [siblings, position] = getNodeSiblingsAndPosition(this);

    if (position === 0) {
      // this node is the first child of its parent, so there is no previous sibling.
      return null;
    }

    return siblings[position - 1];
  }

  /**
   * @abstract
   */
  get textContent(): string {
    throw new TypeError(
      '`textContent` is abstract and must be implemented in a subclass of `ReadOnlyNode`',
    );
  }

  compareDocumentPosition(otherNode: ReadOnlyNode): number {
    // Quick check to avoid having to call into Fabric if the nodes are the same.
    if (otherNode === this) {
      return 0;
    }

    const shadowNode = getNativeNodeReference(this);
    const otherShadowNode = getNativeNodeReference(otherNode);

    if (shadowNode == null || otherShadowNode == null) {
      return ReadOnlyNode.DOCUMENT_POSITION_DISCONNECTED;
    }

    return NativeDOM.compareDocumentPosition(shadowNode, otherShadowNode);
  }

  contains(otherNode: ReadOnlyNode): boolean {
    if (otherNode === this) {
      return true;
    }

    const position = this.compareDocumentPosition(otherNode);
    // eslint-disable-next-line no-bitwise
    return (position & ReadOnlyNode.DOCUMENT_POSITION_CONTAINED_BY) !== 0;
  }

  getRootNode(): ReadOnlyNode {
    if (this.isConnected) {
      // If this is the document node, then the root node is itself.
      return this.ownerDocument ?? this;
    }

    return this;
  }

  hasChildNodes(): boolean {
    return getChildNodes(this).length > 0;
  }

  /*
   * Node types, as returned by the `nodeType` property.
   */

  /**
   * Type of Element, HTMLElement and ReactNativeElement instances.
   */
  static ELEMENT_NODE: number = 1;
  /**
   * Currently Unused in React Native.
   */
  static ATTRIBUTE_NODE: number = 2;
  /**
   * Text nodes.
   */
  static TEXT_NODE: number = 3;
  /**
   * @deprecated Unused in React Native.
   */
  static CDATA_SECTION_NODE: number = 4;
  /**
   * @deprecated
   */
  static ENTITY_REFERENCE_NODE: number = 5;
  /**
   * @deprecated
   */
  static ENTITY_NODE: number = 6;
  /**
   * @deprecated Unused in React Native.
   */
  static PROCESSING_INSTRUCTION_NODE: number = 7;
  /**
   * @deprecated Unused in React Native.
   */
  static COMMENT_NODE: number = 8;
  /**
   * Document nodes.
   */
  static DOCUMENT_NODE: number = 9;
  /**
   * @deprecated Unused in React Native.
   */
  static DOCUMENT_TYPE_NODE: number = 10;
  /**
   * @deprecated Unused in React Native.
   */
  static DOCUMENT_FRAGMENT_NODE: number = 11;
  /**
   * @deprecated
   */
  static NOTATION_NODE: number = 12;

  /*
   * Document position flags. Used to check the return value of
   * `compareDocumentPosition()`.
   */

  /**
   * Both nodes are in different documents.
   */
  static DOCUMENT_POSITION_DISCONNECTED: number = 1;
  /**
   * `otherNode` precedes the node in either a pre-order depth-first traversal of a tree containing both
   * (e.g., as an ancestor or previous sibling or a descendant of a previous sibling or previous sibling of an ancestor)
   * or (if they are disconnected) in an arbitrary but consistent ordering.
   */
  static DOCUMENT_POSITION_PRECEDING: number = 2;
  /**
   * `otherNode` follows the node in either a pre-order depth-first traversal of a tree containing both
   * (e.g., as a descendant or following sibling or a descendant of a following sibling or following sibling of an ancestor)
   * or (if they are disconnected) in an arbitrary but consistent ordering.
   */
  static DOCUMENT_POSITION_FOLLOWING: number = 4;
  /**
   * `otherNode` is an ancestor of the node.
   */
  static DOCUMENT_POSITION_CONTAINS: number = 8;
  /**
   * `otherNode` is a descendant of the node.
   */
  static DOCUMENT_POSITION_CONTAINED_BY: number = 16;
  /**
   * @deprecated Unused in React Native.
   */
  static DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number = 32;
}

setPlatformObject(ReadOnlyNode);

export function getChildNodes(
  node: ReadOnlyNode,
): $ReadOnlyArray<ReadOnlyNode> {
  const shadowNode = getNativeNodeReference(node);

  if (shadowNode == null) {
    return [];
  }

  const childNodeInstanceHandles = NativeDOM.getChildNodes(shadowNode);
  return childNodeInstanceHandles
    .map(instanceHandle => getPublicInstanceFromInstanceHandle(instanceHandle))
    .filter(Boolean);
}

function getNodeSiblingsAndPosition(
  node: ReadOnlyNode,
): [$ReadOnlyArray<ReadOnlyNode>, number] {
  const parent = node.parentNode;
  if (parent == null) {
    // This node is the root or it's disconnected.
    return [[node], 0];
  }

  const siblings = getChildNodes(parent);
  const position = siblings.indexOf(node);

  if (position === -1) {
    throw new TypeError("Missing node in parent's child node list");
  }

  return [siblings, position];
}

let ReadOnlyElementClass;
function getReadOnlyElementClass(): Class<ReadOnlyElement> {
  if (ReadOnlyElementClass == null) {
    // We initialize this lazily to avoid a require cycle.
    ReadOnlyElementClass = require('./ReadOnlyElement').default;
  }
  return ReadOnlyElementClass;
}
