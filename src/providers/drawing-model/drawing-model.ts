import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

export interface NormalizedCoordinates {
  x: number;
  y: number;
}

export interface PointDrawingEvent {
  type: 'point';
  timestamp: number;
  pathName: string;
  point: NormalizedCoordinates;
}

export interface EraseDrawingEvent {
  type: 'erase';
  timestamp: number;
  pathName: string;
  point: NormalizedCoordinates;
}

export interface UndoDrawingEvent {
  type: 'undo';
  timestamp: number;
}

export interface RedoDrawingEvent {
  type: 'redo';
  timestamp: number;
}

export type DrawingEvent = PointDrawingEvent | EraseDrawingEvent | UndoDrawingEvent | RedoDrawingEvent;

export interface DrawingEvents extends Array<DrawingEvent> {}

export interface DrawingModelInterface {
  drawingEvents: DrawingEvents
}

export class DrawingEventList {
  constructor(private drawingEventList: FirebaseListObservable<DrawingEvents>) {}

  public storeDrawingEvent(drawingEvent: DrawingEvent, index: number) {
    this.drawingEventList.update(index.toString(), drawingEvent);
  }
}

@Injectable()
export class DrawingModel {

  private readonly INSTANCES_PATH: string = "/drawings";

  constructor(private angularFireDatabase: AngularFireDatabase) {
    console.log('Hello DrawingModel Provider');
  }

  public createInstance(): string {
    var drawingInstance: DrawingModelInterface = {
      drawingEvents: []
    };
    return this.angularFireDatabase.list(this.INSTANCES_PATH).push(drawingInstance).key;
  }

  private _loadInstance(key: string): FirebaseObjectObservable<DrawingModelInterface> {
    return this.angularFireDatabase.object(this.INSTANCES_PATH + '/' + key);
  }

  public loadInstance(key: string): Observable<DrawingModelInterface> {
    return this._loadInstance(key);
  }

  public loadDrawingEvents(key: string): DrawingEventList {
    return new DrawingEventList(this.angularFireDatabase.list(`${this.INSTANCES_PATH }/${key}/drawingEvents/`));
  }
}
