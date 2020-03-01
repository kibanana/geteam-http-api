import mongoose from 'mongoose';
import { IAccount } from './account';
import { IContest } from './contest';
import { connection } from './Database';

export interface IContestApply extends mongoose.Document {
  _id: IAccount['_id'];
  kind: string;
  item: IContest['_id'];
  applyAccount: IAccount['_id'];
  recvAccount: IAccount['_id'];
  topic: string;
  title: string;
  part: string;
  portfolio: string;
  want: string;
  accept: boolean;
  active: boolean;
};

const applyContestSchema = new mongoose.Schema({
  kind: { type: String, required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  applyAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  recvAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  topic: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  part: { type: String, required: true, trim: true },
  portfolio: { type: String, required: true, trim: true },
  want: { type: String, required: true, trim: true },
  accept: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
});

applyContestSchema.statics = {
  // 신청하기
  createApplyContest:
  function (kind: string, itemNum: number, applyAccount: string, recvAccount: string, topic: string, title: string, part: string, portfolio: string, want: string) {
    return this.create({
      kind, itemNum, applyAccount, recvAccount, topic, title, part, portfolio, want,
    });
  },
  // 모든 신청 받아오기
  getApplyContests: function () {
    return this.find({});
  },
  // 내가 한 모든 신청 받아오기
  getApplyContestById: function (userId: string) {
    return this.find({ applyAccount: userId });
  },
  // 내가 한 신청 종류별로 받아오기
  getApplyContestByIdAndKind: function (userId: string, kind: string) {
    return this.find({ applyAccount: userId, kind });
  },
  // 내가 한 신청 변경하기
  updateApplyContest: function (userId: string, itemNum: number, topic: string, title: string, part: string, portfolio: string, want: string) {
    return this.findOneAndUpdate({ applyAccount: userId, itemNum }, {
      topic, title, part, portfolio, want,
    }, { returnNewDocument: true });
  },
  // 내가 한 신청 삭제하기
  removeApplyContest: function (userId: string, itemNum: number) {
    return this.findOneAndDelete({ applyAccount: userId, itemNum });
  },
  // 신청 한 게시물인지 확인
  isApplied: function (userId: string, kind: string, itemNum: number) {
    this.find({
      kind,
      itemNum,
      applyAccount: userId,
    }, (err: any, result: string | string[]) => {
      if (err) {
        return false;
      }
      if (!result.length) {
        return true;
      }
    });
  },
  // 신청 한 게시물이 받아들여졌는지 확인
  isConfirmed: function (userId: string, kind: string, itemNum: string) {
    this.find({
      kind,
      itemNum,
      applyAccount: userId,
      applyChk: 1,
    }, (err: any, result: string | string[]) => {
      if (err) {
        return false;
      }
      if (!result.length) {
        return true;
      }
    });
  },
};

export const ContestApply: mongoose.Model<IContestApply> = connection.model<IContestApply>('ContestApply', applyContestSchema);
