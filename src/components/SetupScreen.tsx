import React from 'react';
import { Database, AlertCircle, FileCode2 } from 'lucide-react';

export function SetupScreen() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-lime-500/10 text-lime-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Database Setup Required</h1>
          <p className="text-neutral-400 text-lg">
            FlexR requires a Supabase PostgreSQL database to function.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-sm font-medium">1</span>
              Create a Supabase Project
            </h2>
            <p className="text-neutral-400 pl-8">
              Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-lime-400 hover:underline">supabase.com</a> and create a new project.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-sm font-medium">2</span>
              Configure Environment Variables
            </h2>
            <p className="text-neutral-400 pl-8">
              Find your API credentials in Project Settings {'>'} API and add them to this project's Secrets or <code className="text-lime-300 bg-lime-400/10 px-1.5 py-0.5 rounded text-sm">.env</code> file.
            </p>
            <div className="pl-8">
              <pre className="bg-neutral-950 border border-neutral-800 p-4 rounded-lg overflow-x-auto text-sm text-neutral-300">
                <code>
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
                </code>
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-sm font-medium">3</span>
              Initialize Database Schema
            </h2>
            <p className="text-neutral-400 pl-8">
              Run the provided SQL schema in your Supabase SQL Editor.
            </p>
            <div className="pl-8 p-4 bg-lime-500/10 border border-lime-500/20 rounded-lg flex items-start gap-3">
              <FileCode2 className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
              <div className="text-sm text-lime-200/80">
                A complete database schema script has been generated in <code className="text-lime-300 font-mono">supabase-schema.sql</code>. Copy its contents and execute it in your Supabase project's SQL Editor to create all necessary tables and security policies.
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-sm font-medium">4</span>
              Create Admin User
            </h2>
            <p className="text-neutral-400 pl-8">
              In Supabase Authentication, create a new user with an email and password. This will be your admin login.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-neutral-500" />
          <p>
            The application is currently locked because the database connection variables are missing. Once you add them, the application will automatically initialize.
          </p>
        </div>
      </div>
    </div>
  );
}
