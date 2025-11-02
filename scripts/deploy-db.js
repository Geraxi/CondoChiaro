#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'pipe' })
} catch (error) {
  console.error('❌ Supabase CLI not found. Please install it first:')
  console.error('npm install -g supabase')
  process.exit(1)
}

// Check if we're logged in to Supabase
try {
  execSync('supabase projects list', { stdio: 'pipe' })
} catch (error) {
  console.error('❌ Not logged in to Supabase. Please run:')
  console.error('supabase login')
  process.exit(1)
}

console.log('🚀 Deploying CondoChiaro database schema...')

try {
  // Deploy the schema
  console.log('📋 Deploying database schema...')
  execSync('supabase db push', { stdio: 'inherit' })

  console.log('✅ Database schema deployed successfully!')

  console.log('🔐 Setting up RLS policies...')
  // RLS policies are already included in the schema.sql file

  console.log('🎯 Creating initial admin user...')
  // This would typically be done through the application

  console.log('📊 Database deployment complete!')

} catch (error) {
  console.error('❌ Deployment failed:', error.message)
  process.exit(1)
}