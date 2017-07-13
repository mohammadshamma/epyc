import { Component, OnInit } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { GameModel, GameAtom } from '../../providers/game-model/game-model';
import { DrawingModel } from '../../providers/drawing-model/drawing-model';
import { Auth, AuthUserInfo } from '../../providers/auth/auth';

@Component({
  selector: 'page-draw',
  templateUrl: 'draw.html'
})
export class DrawPage implements OnInit {

  private readonly COUNTDOWN_IN_SECONDS: number = 9;
  private readonly COUNTDOWN_STEP_IN_SECONDS: number = 1;
  private readonly MILLISECONDS_IN_SECOND: number = 1000;

  private gameAtomKey: string;
  word: string;
  drawingKey: string = '';
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  countdownInProgress: boolean = false;
  countdownValue: number = this.COUNTDOWN_IN_SECONDS;

  constructor(
      navParams: NavParams, 
      private gameModel: GameModel, 
      private drawingModel: DrawingModel,
      private auth: Auth,
      private nav: NavController) {
    console.log("Hello DrawPage");
    this.gameAtomKey = navParams.get('gameAtomKey');
    this.word = navParams.get('word');
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter DrawPage')
    this.gameModel.loadAtom(this.gameAtomKey)
        .takeUntil(this.ngUnsubscribe)
        .subscribe((gameAtom: GameAtom) => {
      if (gameAtom.drawingRef) {
        this.drawingKey = gameAtom.drawingRef;
      } else {
        this.gameModel.upsertAtom(this.gameAtomKey, {drawingRef: this.drawingModel.createInstance()})
      }
    });
  }

  next() {
    if (this.countdownInProgress) {
      this.countdownInProgress = false;
    } else {
      this.countdownInProgress = true;
      this.countdownValue = this.COUNTDOWN_IN_SECONDS;
      setTimeout(() => this.handleCountdown(), this.COUNTDOWN_STEP_IN_SECONDS * this.MILLISECONDS_IN_SECOND);
    }
  }

  private handleCountdown() {
    if (!this.countdownInProgress) return;
    this.countdownValue -= this.COUNTDOWN_STEP_IN_SECONDS;
    if (this.countdownValue <= 0) {
      console.log('Moving away from drawing page.');
      this.auth.getUserInfo().then((authUserInfo: AuthUserInfo) => {
        this.gameModel.upsertAtom(this.gameAtomKey, {done: true, authorUid: authUserInfo.uid}).then(() => {
          this.nav.pop();
        })
      });
    } else {
      setTimeout(() => this.handleCountdown(), this.COUNTDOWN_STEP_IN_SECONDS * this.MILLISECONDS_IN_SECOND);
    }
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave DrawPage')
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit(): void {
    console.log("ngOnInit DrawPage");
  }
}
